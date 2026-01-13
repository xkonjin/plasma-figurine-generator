"use client";

interface PromptSectionProps {
  name: string;
  setName: (name: string) => void;
  activity: string;
  setActivity: (activity: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
}

const PRESET_ACTIVITIES = [
  { value: "working at a laptop", label: "Working", emoji: "💻" },
  { value: "presenting at a whiteboard", label: "Presenting", emoji: "📊" },
  { value: "having a coffee break", label: "Coffee Break", emoji: "☕" },
  { value: "coding at a multi-monitor setup", label: "Coding", emoji: "⌨️" },
  { value: "celebrating a win", label: "Celebrating", emoji: "🎉" },
  { value: "reading a book", label: "Reading", emoji: "📚" },
  { value: "doing yoga", label: "Yoga", emoji: "🧘" },
  { value: "playing video games", label: "Gaming", emoji: "🎮" },
  { value: "cooking", label: "Cooking", emoji: "👨‍🍳" },
  { value: "gardening", label: "Gardening", emoji: "🌱" },
  { value: "cycling", label: "Cycling", emoji: "🚴" },
  { value: "listening to music", label: "Music", emoji: "🎧" },
  { value: "painting", label: "Painting", emoji: "🎨" },
  { value: "photography", label: "Photography", emoji: "📷" },
  { value: "brainstorming with sticky notes", label: "Brainstorming", emoji: "💡" },
  { value: "mentoring at a whiteboard", label: "Mentoring", emoji: "👨‍🏫" },
];

export function PromptSection({
  name,
  setName,
  activity,
  setActivity,
  customPrompt,
  setCustomPrompt,
}: PromptSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
      <h2 className="text-xl font-medium plasma-green-text">
        2. Customize Your Figurine
      </h2>

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-[#295B4F] mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-[#569F8C]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#295B4F] focus:border-transparent transition-all"
        />
      </div>

      {/* Activity Selection */}
      <div>
        <label className="block text-sm font-medium text-[#295B4F] mb-2">
          Activity / Pose
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PRESET_ACTIVITIES.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setActivity(preset.value)}
              className={`p-2 rounded-lg text-center transition-all ${
                activity === preset.value
                  ? "plasma-green text-white"
                  : "bg-[#DCEFEA] text-[#295B4F] hover:bg-[#569F8C]/20"
              }`}
            >
              <span className="text-lg block">{preset.emoji}</span>
              <span className="text-xs">{preset.label}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Or type a custom activity..."
          className="w-full px-4 py-3 border border-[#569F8C]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#295B4F] focus:border-transparent transition-all"
        />
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-[#295B4F] mb-2">
          Additional Details (Optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add any extra details... e.g., 'wearing glasses', 'with a pet dog', 'at the beach'"
          rows={3}
          className="w-full px-4 py-3 border border-[#569F8C]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#295B4F] focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-[#569F8C] mt-2">
          Your figurine will automatically include subtle Plasma branding (green outfit, logo elements)
        </p>
      </div>
    </div>
  );
}
