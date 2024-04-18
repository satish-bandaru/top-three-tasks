import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import CustomizationOptions from './components/CustomizationOptions';
import { TaskType } from './types';
import { FontOption, TaskSection } from './constants';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RemoteSyncStorage from './components/RemoteSyncStorage';

function App() {
  const [topTasks, setTopTasks] = useState<TaskType[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<TaskType[]>([]);
  const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [font, setFont] = useState(FontOption.ROBOTO);
  const [isDefocusCollapsed, setIsDefocusCollapsed] = useState(() => {
    const saved = localStorage.getItem('isDefocusCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    if (chrome.storage) {
      let syncHasTasks;
      RemoteSyncStorage().getRemoteTasks().then((tasks) => {
        setTopTasks(tasks[0]);
        setBacklogTasks(tasks[1]);
        syncHasTasks = tasks[0].length > 0 || tasks[1].length > 0;
      });

      if (!syncHasTasks) {
        chrome.storage.local.get(['topTasks', 'backlogTasks'], (result: { topTasks?: TaskType[]; backlogTasks?: TaskType[] }) => {
          setTopTasks(result.topTasks || []);
          setBacklogTasks(result.backlogTasks || []);
        });
      }
    }
    chrome.storage.local.get('theme').then((result) => {
      if (result.theme) {
        setTheme(result.theme);
      } else {
        setTheme(theme);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('isDefocusCollapsed', String(isDefocusCollapsed));
  }, [isDefocusCollapsed]);

  useEffect(() => {
    chrome.storage.local.get(['selectedFont'], (result) => {
      if (result.selectedFont && Object.values(FontOption).includes(result.selectedFont)) {
        setFont(result.selectedFont);
      }
    });
  }, []);

  const handleFontChange = (selectedFont: FontOption) => {
    setFont(selectedFont);
    // Persist the selected font to chrome.storage
    chrome.storage.local.set({ 'selectedFont': selectedFont }, () => {
      console.log('Font is set to ' + selectedFont);
    });
  };

  const onToggleCompletion = (taskId: string) => {
    const newTopTasks = topTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task);
    const newBacklogTasks = backlogTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task);

    setTopTasks(newTopTasks);
    setBacklogTasks(newBacklogTasks);

    chrome.storage.local.set({ topTasks: newTopTasks, backlogTasks: newBacklogTasks });
    storeTasksToSyncStorage(newTopTasks, newBacklogTasks);
  };

  const onDelete = (taskId: string) => {
    const newTopTasks = topTasks.filter(task => task.id !== taskId);
    const newBacklogTasks = backlogTasks.filter(task => task.id !== taskId);

    setTopTasks(newTopTasks);
    setBacklogTasks(newBacklogTasks);

    chrome.storage.local.set({ topTasks: newTopTasks, backlogTasks: newBacklogTasks });
    storeTasksToSyncStorage(newTopTasks, newBacklogTasks);
  };

  const onEditFinished = (taskId: string, newText: string) => {
    if (!newText.trim()) {
      onDelete(taskId);
      return;
    }
    const updatedTopTasks = topTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task);
    const updatedBacklogTasks = backlogTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task);

    setTopTasks(updatedTopTasks);
    setBacklogTasks(updatedBacklogTasks);

    chrome.storage.local.set({ topTasks: updatedTopTasks, backlogTasks: updatedBacklogTasks });
    storeTasksToSyncStorage(updatedTopTasks, updatedBacklogTasks);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    // Check if trying to add a fourth task to the Top tasks
    if (destination.droppableId === TaskSection.FOCUS &&
      topTasks.length >= 3 &&
      source.droppableId !== TaskSection.FOCUS
    ) {
      toast.error(
        "3's a crowd! Complete focus tasks to add more",
        { autoClose: 2000, closeButton: false }
      );
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = source.droppableId === TaskSection.FOCUS ? topTasks : backlogTasks;
    const finish = destination.droppableId === TaskSection.FOCUS ? topTasks : backlogTasks;

    // Moving items within the same list
    if (start === finish) {
      const newTasks = Array.from(start);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const updatedState = source.droppableId === TaskSection.FOCUS
        ? { topTasks: newTasks }
        : { backlogTasks: newTasks };

      if (source.droppableId === TaskSection.FOCUS) {
        setTopTasks(newTasks);
      } else {
        setBacklogTasks(newTasks);
      }

      // Persist changes to storage
      chrome.storage.local.set(updatedState);
    } else {
      // Moving items between different lists
      const startTasks = Array.from(start);
      const finishTasks = Array.from(finish);
      const [removed] = startTasks.splice(source.index, 1);
      finishTasks.splice(destination.index, 0, removed);

      const updatedState = source.droppableId === TaskSection.FOCUS
        ? { topTasks: startTasks, backlogTasks: finishTasks }
        : { topTasks: finishTasks, backlogTasks: startTasks };

      setTopTasks(updatedState.topTasks);
      setBacklogTasks(updatedState.backlogTasks);

      // Persist changes to storage
      chrome.storage.local.set(updatedState);
    }
  };

  function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  function storeTasksToSyncStorage(topTasks: TaskType[], backlogTasks: TaskType[]) {
    RemoteSyncStorage().updateRemoteTasks(topTasks, backlogTasks);
  };

  const addTask = (newTaskText: string, taskSection: TaskSection) => {
    if (!newTaskText.trim()) return;
    const newTask: TaskType = {
      id: generateUUID(),
      text: newTaskText,
      completed: false,
      createdDate: new Date().toISOString(),
    };

    if (taskSection === TaskSection.FOCUS) {
      const updatedTopTasks = topTasks.length < 3 ? [...topTasks, newTask] : topTasks;
      setTopTasks(updatedTopTasks);
      if (chrome.storage) {
        chrome.storage.local.set({ topTasks: updatedTopTasks });
        storeTasksToSyncStorage(updatedTopTasks, backlogTasks);
      }
    } else if (taskSection === TaskSection.DEFOCUS) {
      const updatedBacklogTasks = [...backlogTasks, newTask];
      setBacklogTasks(updatedBacklogTasks);
      if (chrome.storage) {
        chrome.storage.local.set({ backlogTasks: updatedBacklogTasks });
        storeTasksToSyncStorage(topTasks, updatedBacklogTasks);
      }
    }
  };

  function calculateHeight(tasks: TaskType[]) {
    const baseHeight = 10; // Minimal height when there are no tasks
    const heightPerTask = 40; // Additional height per task
    return `${baseHeight + (tasks.length * heightPerTask)}px`;
  }

  const toggleDefocusCollapse = () => {
    setIsDefocusCollapsed(!isDefocusCollapsed);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={`container app ${theme}`} style={{ fontFamily: font }}>
        <div className="body-container">
          <div className="task-section" style={{ minHeight: calculateHeight(topTasks) }}>
            <div className="task-list">
              <TaskList
                tasks={topTasks}
                sectionId={TaskSection.FOCUS}
                onToggleCompletion={onToggleCompletion}
                onDelete={onDelete}
                onEditFinished={onEditFinished}
                theme={theme}
                addTask={addTask}
              />
            </div>
          </div>

          <div className="task-section" style={{ minHeight: calculateHeight(backlogTasks) }}>
            <div className="task-list">
              <TaskList
                tasks={backlogTasks}
                sectionId={TaskSection.DEFOCUS}
                onToggleCompletion={onToggleCompletion}
                onDelete={onDelete}
                onEditFinished={onEditFinished}
                theme={theme}
                isCollapsed={isDefocusCollapsed}
                onToggleCollapsed={toggleDefocusCollapse}
                addTask={addTask}
              />
            </div>
          </div>
        </div>
      </div>
      <CustomizationOptions currentFont={font} onFontChange={handleFontChange} />
      <ToastContainer position="bottom-center" />
    </DragDropContext>
  );
}

export default App;