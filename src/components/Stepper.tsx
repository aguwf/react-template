import React, { useState, useCallback, useMemo, useEffect } from "react";

// Types
interface StepperProps {
  unit: string;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

interface TooltipProps {
  message: string;
  visible: boolean;
}

interface StepperButtonProps {
  onClick: () => void;
  disabled: boolean;
  tooltipVisible: boolean;
  setTooltipVisible: (visible: boolean) => void;
  tooltipMessage: string;
  icon: string;
  position: 'left' | 'right';
}

const Tooltip = ({ message, visible }: TooltipProps) => 
  (!visible || !message) ? null : (
    <div className="absolute z-50 -top-8 left-1/2">
      <div className="relative bg-[#000000] text-white text-xs font-inter px-2 py-[3px] rounded-md shadow-md whitespace-nowrap tooltip-animation">
        {message}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#000000]"></div>
      </div>
    </div>
  );

const StepperButton = ({ 
  onClick, 
  disabled, 
  tooltipVisible, 
  setTooltipVisible, 
  tooltipMessage, 
  icon, 
  position 
}: StepperButtonProps) => {
  const isLeft = position === 'left';
  const roundedClass = isLeft ? 'rounded-l-lg' : 'rounded-r-lg';
  const hoverClass = !disabled && "hover:bg-[#3B3B3B] cursor-pointer";
  return (
    <div className="relative h-full">
      <button
        className={`z-10 flex items-center justify-center h-full text-xl leading-none w-9 font-inter ${roundedClass} transition-all duration-300 ${hoverClass}`}
        onClick={onClick}
        aria-label={isLeft ? "Decrease value" : "Increase value"}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <span className={`mb-0.5 ${disabled ? "opacity-30" : ""}`}>{icon}</span>
      </button>
      <Tooltip message={tooltipMessage} visible={tooltipVisible && disabled} />
    </div>
  );
};

const tooltipStyles = `
  @keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateY(4px) translateX(-50%); }
    to { opacity: 1; transform: translateY(0) translateX(-50%); }
  }
  
  .tooltip-animation {
    opacity: 0;
    animation: tooltipFadeIn 0.2s ease-out forwards;
  }
`;

const Stepper = ({
  unit,
  initialValue = 0,
  min: propMin,
  max: propMax,
  step = 1,
}: StepperProps) => {
  const isPercentUnit = unit === "%";
  const min = propMin ?? 0;
  const max = propMax ?? (isPercentUnit ? 100 : Infinity);

  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const [inputState, setInputState] = useState({ isHovered: false, isFocused: false });
  const [decrementTooltip, setDecrementTooltip] = useState(false);
  const [incrementTooltip, setIncrementTooltip] = useState(false);

  const isDecrementDisabled = useMemo(
    () => isPercentUnit && value <= min,
    [isPercentUnit, value, min]
  );

  const isIncrementDisabled = useMemo(
    () => isPercentUnit && value >= max,
    [isPercentUnit, value, max]
  );

  const tooltipMessages = useMemo(
    () => ({
      decrement: isPercentUnit ? `Value cannot be less than ${min}%` : "",
      increment: isPercentUnit ? `Value cannot exceed ${max}%` : "",
    }),
    [isPercentUnit, min, max]
  );

  const updateValue = useCallback(
    (newValue: number) => {
      const clampedValue = isPercentUnit ? Math.max(min, Math.min(max, newValue)) : newValue;
      setValue(clampedValue);
      setInputValue(clampedValue.toString());
    },
    [isPercentUnit, min, max]
  );

  const handleIncrement = useCallback(() => {
    if (!isIncrementDisabled) updateValue(value + step);
  }, [value, step, isIncrementDisabled, updateValue]);

  const handleDecrement = useCallback(() => {
    if (!isDecrementDisabled) updateValue(value - step);
  }, [value, step, isDecrementDisabled, updateValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value;
    
      // Allow empty, single dot, or valid number pattern
      if (newInputValue === "" || 
          newInputValue === "." || 
          /^-?\d*\.?\d*$/.test(newInputValue)) {
        setInputValue(newInputValue);
      
        // Only update numerical value if we have a valid number
        if (newInputValue !== "" && newInputValue !== ".") {
          const numValue = parseFloat(newInputValue);
          if (!isNaN(numValue)) {
            setValue(numValue);
          }
        } else if (newInputValue === "") {
          setValue(0);
        }
      }
    },
    []
  );

  const handleInputBlur = useCallback(() => {
    updateInputState('isFocused', false);
  
    // Clean up input on blur
    if (inputValue === "" || inputValue === ".") {
      updateValue(0);
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        updateValue(numValue);
      } else {
        updateValue(value);
      }
    }
  }, [inputValue, updateValue, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      }
    },
    [handleIncrement, handleDecrement]
  );

  const updateInputState = useCallback((key: 'isHovered' | 'isFocused', value: boolean) => {
    setInputState(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (unit === "%" && (value < min || value > max)) {
      const clampedValue = Math.min(max, Math.max(min, value));
      setValue(clampedValue);
      setInputValue(clampedValue.toString());
    }
  }, [max, min, unit, value]);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  const containerClass = `flex gap-2 rounded-lg h-9 w-[140px] transition-all duration-300 ${
    inputState.isFocused
      ? "bg-[#212121] ring-2 ring-blue-500 ring-opacity-70"
      : inputState.isHovered
      ? "bg-[#3B3B3B]"
      : "bg-[#212121]"
  }`;

  return (
    <>
      <style>{tooltipStyles}</style>
      <div className="relative mt-4">
        <div className={containerClass}>
          <StepperButton
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            tooltipVisible={decrementTooltip}
            setTooltipVisible={setDecrementTooltip}
            tooltipMessage={tooltipMessages.decrement}
            icon="-"
            position="left"
          />

          <div className="relative flex items-center flex-1">
            <input
              type="text"
              className="box-border w-full h-full min-w-0 p-0 text-center bg-transparent border-none outline-none appearance-none font-inter"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => updateInputState('isHovered', true)}
              onMouseLeave={() => updateInputState('isHovered', false)}
              onFocus={() => updateInputState('isFocused', true)}
              onBlur={handleInputBlur}
              aria-valuemin={isPercentUnit ? min : undefined}
              aria-valuemax={isPercentUnit ? max : undefined}
              aria-valuenow={value}
              role="spinbutton"
            />
          </div>

          <StepperButton
            onClick={handleIncrement}
            disabled={isIncrementDisabled}
            tooltipVisible={incrementTooltip}
            setTooltipVisible={setIncrementTooltip}
            tooltipMessage={tooltipMessages.increment}
            icon="+"
            position="right"
          />
        </div>
      </div>
    </>
  );
};
export default Stepper;
