"""
Media processing utilities for stories.
"""
import os
import subprocess
import tempfile
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings


def process_image(image_file, max_width=None, quality=None):
    """
    Process and compress an image.
    
    Args:
        image_file: Django uploaded file
        max_width: Maximum width in pixels (default from settings)
        quality: JPEG quality 1-100 (default from settings)
    
    Returns:
        Processed image file
    """
    max_width = max_width or getattr(settings, 'IMAGE_MAX_WIDTH', 1080)
    quality = quality or getattr(settings, 'IMAGE_JPEG_QUALITY', 70)
    
    # Open image
    img = Image.open(image_file)
    
    # Convert RGBA to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = rgb_img
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize if needed
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Save to memory
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    # Create new file
    filename = os.path.splitext(image_file.name)[0] + '.jpg'
    return ContentFile(output.read(), name=filename)


def process_video(video_file, max_resolution=None, max_duration=None):
    """
    Process and compress a video using FFmpeg.
    
    Args:
        video_file: Django uploaded file
        max_resolution: Tuple (width, height) (default from settings)
        max_duration: Maximum duration in seconds (default from settings)
    
    Returns:
        Path to processed video file
    """
    max_resolution = max_resolution or getattr(settings, 'VIDEO_MAX_RESOLUTION', (1280, 720))
    max_duration = max_duration or getattr(settings, 'MAX_VIDEO_DURATION_SECONDS', 60)
    
    # Create temporary files
    temp_dir = tempfile.gettempdir()
    temp_input = os.path.join(temp_dir, f'input_{video_file.name}')
    temp_output = os.path.join(temp_dir, f'output_{video_file.name}')
    
    # Save uploaded file temporarily
    with open(temp_input, 'wb') as f:
        for chunk in video_file.chunks():
            f.write(chunk)
    
    # Build FFmpeg command
    cmd = [
        'ffmpeg',
        '-i', temp_input,
        '-vf', f'scale={max_resolution[0]}:{max_resolution[1]}:force_original_aspect_ratio=decrease',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',  # Overwrite output file
        temp_output
    ]
    
    # Add duration limit if specified
    if max_duration:
        cmd.insert(-2, '-t')
        cmd.insert(-2, str(max_duration))
    
    try:
        # Run FFmpeg
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        
        # Read processed video
        with open(temp_output, 'rb') as f:
            video_content = f.read()
        
        # Cleanup
        os.remove(temp_input)
        os.remove(temp_output)
        
        # Return as ContentFile
        filename = os.path.splitext(video_file.name)[0] + '.mp4'
        return ContentFile(video_content, name=filename)
        
    except subprocess.CalledProcessError as e:
        # Cleanup on error
        if os.path.exists(temp_input):
            os.remove(temp_input)
        if os.path.exists(temp_output):
            os.remove(temp_output)
        raise ValueError(f"Video processing failed: {e.stderr.decode()}")
    except Exception as e:
        # Cleanup on error
        if os.path.exists(temp_input):
            os.remove(temp_input)
        if os.path.exists(temp_output):
            os.remove(temp_output)
        raise ValueError(f"Video processing error: {e}")


def process_video_with_thumbnail(
    video_file,
    max_resolution=None,
    max_duration=None,
    thumbnail_width: int | None = None,
):
    """
    Process and compress a video using FFmpeg and extract the first-frame thumbnail.

    Returns:
        (processed_video: ContentFile, thumbnail_image: ContentFile)
    """
    max_resolution = max_resolution or getattr(settings, 'VIDEO_MAX_RESOLUTION', (1280, 720))
    max_duration = max_duration or getattr(settings, 'MAX_VIDEO_DURATION_SECONDS', 60)
    thumbnail_width = thumbnail_width or getattr(settings, 'VIDEO_THUMBNAIL_WIDTH', 360)

    temp_dir = tempfile.gettempdir()
    temp_input = os.path.join(temp_dir, f'input_{video_file.name}')
    temp_output = os.path.join(temp_dir, f'output_{os.path.splitext(video_file.name)[0]}.mp4')
    temp_thumb = os.path.join(temp_dir, f'thumb_{os.path.splitext(video_file.name)[0]}.jpg')

    with open(temp_input, 'wb') as f:
        for chunk in video_file.chunks():
            f.write(chunk)

    cmd = [
        'ffmpeg',
        '-i', temp_input,
        '-vf', f'scale={max_resolution[0]}:{max_resolution[1]}:force_original_aspect_ratio=decrease',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        temp_output,
    ]

    if max_duration:
        cmd.insert(-2, '-t')
        cmd.insert(-2, str(max_duration))

    thumb_cmd = [
        'ffmpeg',
        '-i', temp_output,
        '-ss', '0',
        '-frames:v', '1',
        '-vf', f'scale={thumbnail_width}:-1:force_original_aspect_ratio=decrease',
        '-q:v', '3',
        '-y',
        temp_thumb,
    ]

    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        subprocess.run(thumb_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

        with open(temp_output, 'rb') as f:
            video_content = f.read()
        with open(temp_thumb, 'rb') as f:
            thumb_content = f.read()

        filename = os.path.splitext(video_file.name)[0] + '.mp4'
        thumb_filename = os.path.splitext(video_file.name)[0] + '.jpg'
        return (
            ContentFile(video_content, name=filename),
            ContentFile(thumb_content, name=thumb_filename),
        )
    except subprocess.CalledProcessError as e:
        raise ValueError(f"Video processing failed: {e.stderr.decode(errors='ignore')}")
    finally:
        for p in (temp_input, temp_output, temp_thumb):
            try:
                if os.path.exists(p):
                    os.remove(p)
            except Exception:
                pass


def extract_thumbnail_from_video_path(
    video_path: str,
    *,
    thumbnail_width: int | None = None,
    name: str | None = None,
):
    """
    Extract first-frame thumbnail from an existing video file path.

    Returns:
        ContentFile (jpg)
    """
    thumbnail_width = thumbnail_width or getattr(settings, 'VIDEO_THUMBNAIL_WIDTH', 360)
    temp_dir = tempfile.gettempdir()
    base = os.path.splitext(os.path.basename(video_path))[0]
    temp_thumb = os.path.join(temp_dir, f'thumb_{base}.jpg')

    thumb_cmd = [
        'ffmpeg',
        '-i', video_path,
        '-ss', '0',
        '-frames:v', '1',
        '-vf', f'scale={thumbnail_width}:-1:force_original_aspect_ratio=decrease',
        '-q:v', '3',
        '-y',
        temp_thumb,
    ]

    try:
        subprocess.run(thumb_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        with open(temp_thumb, 'rb') as f:
            thumb_content = f.read()
        filename = name or (base + '.jpg')
        return ContentFile(thumb_content, name=filename)
    finally:
        try:
            if os.path.exists(temp_thumb):
                os.remove(temp_thumb)
        except Exception:
            pass

import os
import tempfile
import subprocess
from uuid import uuid4
from django.core.files.base import ContentFile


def generate_video_thumbnail(video_file):
    """
    Generate thumbnail from a video FileField.
    Returns ContentFile with name.
    """

    input_path = video_file.path

    output_filename = f"story_thumb_{uuid4().hex}.jpg"

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_thumb:
        output_path = temp_thumb.name

    try:
        command = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-q:v", "2",
            output_path,
        ]

        subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )

        with open(output_path, "rb") as f:
            thumbnail_content = ContentFile(f.read(), name=output_filename)

        return thumbnail_content

    except Exception as e:
        print("Thumbnail generation failed:", e)
        return None

    finally:
        if os.path.exists(output_path):
            os.remove(output_path)
