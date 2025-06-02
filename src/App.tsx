import { useState } from "react";
import Stepper from "./components/Stepper"
import { Tabs } from "./components/Tabs";

const App = () => {
  const [unit, setUnit] = useState("%");
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-neutral-950 text-neutral-100">
      <div className="p-4 rounded-lg w-96 bg-neutral-800">
        // Your component go here
        // OK
        <Tabs unit={unit} setUnit={setUnit} />
        <Stepper unit={unit} />
      </div>
    </div>
  )
}

export default App
