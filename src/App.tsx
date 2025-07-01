import { createSignal, For, Show, createEffect } from "solid-js";
import { plans } from "./plans";
import Firework from "./Firework";
import "./firework.css";

const App = () => {
  const [selectedDay, setSelectedDay] = createSignal(Object.keys(plans)[0]);

  // Create signals for completed sets and completion status per exercise
  const completedSignals = {};
  const isCompleteSignals = {};
  Object.keys(plans).forEach((day) => {
    plans[day].forEach((_, idx) => {
      const key = `${day}-${idx}`;
      completedSignals[key] = createSignal(0);
      isCompleteSignals[key] = createSignal(false);
    });
  });

  // Firework state: which exercise key is showing firework (null if none)
  const [fireworkKey, setFireworkKey] = createSignal(null);

  createEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  // Handler for pressing the complete set button
  const handleCompleteSet = (day, idx, totalSets) => {
    const key = `${day}-${idx}`;
    const [completed, setCompleted] = completedSignals[key];
    const [isComplete, setIsComplete] = isCompleteSignals[key];
    if (completed() < totalSets) {
      setCompleted(completed() + 1);
      if (completed() + 1 >= totalSets) {
        setIsComplete(true);
        setFireworkKey(key);
        setTimeout(() => {
          setFireworkKey(null);
        }, 6000); // Show firework for 6 seconds
      }
    }
  };

  return (
    <div class="container mx-auto p-4 text-gray-900 dark:text-white min-h-screen">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Gym Schedule</h1>
      </div>

      <div class="mb-4">
        <label for="day-select" class="mr-2">
          Select a day:
        </label>
        <select
          id="day-select"
          value={selectedDay()}
          onChange={(e) => setSelectedDay(e.currentTarget.value)}
          class="border rounded p-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        >
          <For each={Object.keys(plans)}>
            {(day) => <option value={day}>{day}</option>}
          </For>
        </select>
      </div>

      <h2 class="text-2xl font-bold mb-2">{selectedDay()}</h2>
      <div class="grid gap-6">
        <For each={plans[selectedDay()]}>
          {(exercise, exIdx) => {
            const key = `${selectedDay()}-${exIdx()}`;
            const [completed] = completedSignals[key];
            const [isComplete] = isCompleteSignals[key];
            return (
              <div
                class={`w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-6 relative ${
                  isComplete() ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {/* Firework animation overlay */}
                <Show when={fireworkKey() === key}>
                  <Firework />
                </Show>
                <div class="p-0">
                  <Show
                    when={
                      exercise.videos &&
                      exercise.videos.length > 0 &&
                      !isComplete()
                    }
                  >
                    <div class="flex flex-row gap-2 w-full">
                      <For each={exercise.videos}>
                        {(video) => (
                          <div class="aspect-w-16 aspect-h-9 flex-1">
                            <video
                              src={video}
                              class="rounded-t-lg w-full h-full object-cover"
                              autoplay
                              loop
                              muted
                              playsinline
                            />
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
                <div class="p-5">
                  <h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {exercise.name}
                  </h3>
                  <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {exercise.reps} reps
                  </p>
                  <div class="mb-4">
                    <span class="text-lg font-semibold">
                      Set {Math.min(completed() + 1, exercise.sets)} of{" "}
                      {exercise.sets}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100  focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    disabled={isComplete()}
                    onClick={() =>
                      handleCompleteSet(selectedDay(), exIdx(), exercise.sets)
                    }
                  >
                    Complete Set
                  </button>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default App;
