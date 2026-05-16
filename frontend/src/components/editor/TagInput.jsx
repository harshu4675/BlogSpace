import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";

const TagInput = ({
  tags = [],
  onChange,
  maxTags = 10,
  placeholder = "Add a tag...",
}) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const cleaned = tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < maxTags) {
      onChange([...tags, cleaned]);
    }
    setInput("");
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const suggestedTags = [
    "react",
    "javascript",
    "webdev",
    "tutorial",
    "career",
    "productivity",
    "design",
    "ai",
    "startup",
    "lifestyle",
  ];
  const availableSuggestions = suggestedTags.filter((t) => !tags.includes(t));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300">
          Tags
        </label>
        <span className="text-xs text-dark-400">
          {tags.length}/{maxTags}
        </span>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap gap-2 p-3 rounded-xl border-2 cursor-text transition-all duration-200 
                    min-h-[48px] ${
                      focused
                        ? "border-primary-500 ring-4 ring-primary-500/10 bg-white dark:bg-dark-800"
                        : "border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800"
                    }`}
      >
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 
                         text-primary-700 dark:text-primary-300 text-sm font-medium rounded-lg"
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (input.trim()) addTag(input);
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] bg-transparent border-0 outline-none text-sm 
                       text-dark-900 dark:text-dark-100 placeholder:text-dark-400 p-0"
          />
        )}
      </div>

      <p className="text-xs text-dark-400 mt-1.5">
        Press Enter or comma to add. Backspace to remove.
      </p>

      {/* Suggestions */}
      {tags.length < maxTags && availableSuggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-dark-400 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2.5 py-1 text-xs bg-dark-100 dark:bg-dark-700 text-dark-500 
                           dark:text-dark-400 rounded-lg hover:bg-primary-100 hover:text-primary-600 
                           dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;
