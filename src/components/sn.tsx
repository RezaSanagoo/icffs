import Send from '../assets/send.png';
export default function SendIcon({ className = '' }: { className?: string }) {
  return <img src={Send} className={`app-nav-send-icon max-w-6 max-h-6 ${className}`} alt="Send" />;
}
