import s from "./Tabs.module.scss";

interface TabsProps {
  unit: string;
  setUnit: (unit: string) => void;
  options?: string[];
}

function Tabs({ unit, setUnit, options = ["%", "px"] }: TabsProps) {
  const activeIndex = options.indexOf(unit);
  return (
    <div className={s["tabs-container"]}>
      <div className="tabs h-8 w-[140px] flex gap-0.5 relative bg-[#212121] rounded-lg p-0.5">
        {options.map((item) => (
          <button
            key={item}
            className={`${s.tab} ${unit === item ? s.active : ""} z-20`}
            onClick={() => setUnit(item)}
          >
            {item}
          </button>
        ))}
        <span
          className="absolute bg-[#424242] rounded-lg transition-all duration-300 z-10"
          style={{
            width: `calc(${100 / options.length}% - 2px)`,
            height: "calc(100% - 4px)",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}

export default Tabs;
