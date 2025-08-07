import { FaCheckDouble, FaRegCopy } from "react-icons/fa";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function MessageBubble({ message, myUserId }) {
    const isMine = String(message.senderId) === String(myUserId);

    const renderStatusIcon = () => {
        if (!isMine) return null;

        switch (message.status) {
            case 1:
                return (
                    <span className="ml-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                );
            case 2:
                return (
                    <span className="ml-1 flex gap-[2px]">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-ping"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                    </span>
                );
            case 3:
                return (
                    <FaCheckDouble
                        size={12}
                        className="ml-1 text-blue-500 dark:text-blue-400 animate-fadeIn"
                    />
                );
            default:
                return null;
        }
    };

    const copyMessage = () => {
        navigator.clipboard.writeText(message.text || "").then(() => {
            toast.success("Message copied!", {
                style: {
                    background: "linear-gradient(135deg, #4cafef, #2563eb)",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "10px 15px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                },
                icon: "📋"
            });
        });
    };

    return (
        <div className={`flex mb-2 sm:mb-3 px-1 sm:px-2 ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-md relative max-w-[85%] sm:max-w-[75%] break-words flex flex-col
                    ${isMine
                        ? "bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-blue-900 text-gray-900 dark:text-white"
                        : "bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white"
                    }
                    border border-white/40 dark:border-white/10
                    backdrop-blur-sm
                    shadow-lg
                    group
                `}
                style={{
                    boxShadow: isMine
                        ? "0 4px 12px rgba(59,130,246,0.3)"
                        : "0 4px 12px rgba(0,0,0,0.15)",
                }}
            >
                {/* Glossy highlight effect */}
                <span
                    className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none"
                    style={{
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent 40%)",
                        borderRadius: "inherit",
                        mixBlendMode: "overlay",
                    }}
                />

                {/* Message Text */}
                <div className="whitespace-pre-wrap leading-relaxed relative z-10 pr-8 sm:pr-6 text-sm sm:text-base">
                    {message.text}
                </div>

                {/* Copy Icon - Mobile Optimized */}
                <button
                    onClick={copyMessage}
                    className="absolute top-1 right-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5 sm:p-1 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 sm:opacity-100 touch-manipulation"
                    title="Copy message"
                >
                    <FaRegCopy size={14} className="sm:w-3 sm:h-3" />
                </button>

                {/* Time + Status - Mobile Optimized */}
                <div className="text-[10px] sm:text-[11px] mt-1 flex items-center justify-end gap-1 opacity-80 relative z-10">
                    {dayjs(message.timestamp).format("HH:mm")}
                    {renderStatusIcon()}
                </div>
            </div>
        </div>
    );
}
