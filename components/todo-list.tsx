"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Star, ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Todo {
  id: string
  user_id?: string
  title: string
  completed: boolean
  created_at: string
  starred: boolean
  due_date?: string
  priority?: "low" | "medium" | "high"
  tags?: string[]
  project?: string
  recurring?: "none" | "daily" | "weekly" | "custom"
  interval_days?: number
}

export function TodoList({ onOpenJournal }: { onOpenJournal?: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isAddingTodo, setIsAddingTodo] = useState<boolean>(false)
  const [newTodoTitle, setNewTodoTitle] = useState<string>("")
  const [newDueDate, setNewDueDate] = useState<string>("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTags, setNewTags] = useState<string>("")
  const [newProject, setNewProject] = useState<string>("My Day")
  const [newRecurring, setNewRecurring] = useState<"none" | "daily" | "weekly" | "custom">("none")
  const [newIntervalDays, setNewIntervalDays] = useState<number>(2)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState<string>("")
  const [editDueDate, setEditDueDate] = useState<string>("")
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium")
  const [editTags, setEditTags] = useState<string>("")
  const [editProject, setEditProject] = useState<string>("My Day")
  const [editRecurring, setEditRecurring] = useState<"none" | "daily" | "weekly" | "custom">("none")
  const [editIntervalDays, setEditIntervalDays] = useState<number>(2)

  const [showCompleted, setShowCompleted] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: {user}, error} = await (await supabase).auth.getUser();

      
      if (error || !user) {
      console.error("User not logged in or error:", error?.message);
    } else {
      setUser(user);
    }
    }
    loadUser();

  }, []);



  useEffect(() => {
    if(!user) return;

    async function fetchTodos() {
      const { data, error } = await (await supabase).from('todos').select('*').eq("user_id", user?.id).order('created_at', { ascending: false });

      if(error) {
        console.error("Error fetching todos:", error.message);
      } else if(data) {
        setTodos(data);
      }
    }
    fetchTodos();
  }, [user]);


  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;
    if(!user) return;


    const todo: Todo = {
      id: Date.now().toString(),
      user_id: user.id,
      title: newTodoTitle.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      starred: false,
      due_date: newDueDate || undefined,
      priority: newPriority,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      project: newProject || "My Day",
      recurring: newRecurring,
      interval_days: newRecurring === "custom" ? newIntervalDays : undefined,
    }

    const { data, error} = await (await supabase).from("todos").insert([todo]).select();

    if (error) {
    console.error("Failed to insert todo:", error.message);
    return;
  }

    if(data && data.length > 0) {
      setTodos((prev) => [todo, ...prev])
    setNewTodoTitle("")
    setNewDueDate("")
    setNewPriority("medium")
    setNewTags("")
    setNewProject("My Day")
    setNewRecurring("none")
    setNewIntervalDays(2)
    setIsAddingTodo(false)
    }
  }

  const startEdit = (t: Todo) => {
    setEditingId(t.id)
    setEditTitle(t.title)
    setEditDueDate(t.due_date || "")
    setEditPriority(t.priority || "medium")
    setEditTags((t.tags || []).join(", "))
    setEditProject(t.project || "My Day")
    setEditRecurring(t.recurring || "none")
    setEditIntervalDays(t.interval_days || 2)
  }

  const saveEdit = async () => {
    if (!editingId) return
    if(!user) return;

    const updates = {
      title: editTitle.trim() || undefined,
      due_date: editDueDate || null,
      priority: editPriority,
      tags: editTags.split(",").map((s) => s.trim()).filter(Boolean),
      project: editProject || "My Day",
      recurring: editRecurring,
      interval_days: editRecurring === "custom" ? editIntervalDays : null,
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await (await supabase).from("todos").update(updates).eq("id", editingId).eq("user_id", user?.id).select();

    if (error) {
    console.error("Failed to update todo:", error.message);
    return;
  }

    setTodos((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? data[0]
          : t,
      ),
    )
    setEditingId(null)
  }

  const deleteTodo = async (id: string) => {
    if(!user) return;
    const {error} = await (await supabase).from("todos").delete().eq("id",id).eq("user_id", user?.id);

    if (error) {
    console.error("Failed to delete todo:", error.message);
    return;
  }
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const getNextDateISO = (currentISO?: string, type?: Todo["recurring"], intervalDays?: number) => {
    if (!type || type === "none") return undefined
    const base = currentISO ? new Date(currentISO) : new Date()
    if (type === "daily") base.setDate(base.getDate() + 1)
    else if (type === "weekly") base.setDate(base.getDate() + 7)
    else if (type === "custom") base.setDate(base.getDate() + Math.max(1, intervalDays || 2))
    return base.toISOString().slice(0, 10)
  }

  const toggleTodo = async (id: string) => {
    if(!user) return;

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    
    const toggleCompleted = !todo.completed;
    const {data: updatedTodoData, error: updateError} = await (await supabase).from("todos").update({
      completed: toggleCompleted, updated_at: new Date().toISOString()
    }).eq("id", id).eq("user_id", user?.id).select();

    if(updateError || !updatedTodoData || updatedTodoData.length === 0) {
      console.error("Failed to update todo:", updateError?.message);
      return;
    }

    let updatedTodos = todos.map((t) => t.id === id ? updatedTodoData[0] : t);

     if (toggleCompleted && todo.recurring && todo.recurring !== "none") {
    const nextDue = getNextDateISO(todo.due_date, todo.recurring, todo.interval_days);
    const nextTodoToInsert = {
      ...todo,
      id: undefined,
      completed: false,
      created_at: new Date().toISOString(),
      due_date: nextDue,
    };
    delete nextTodoToInsert.id;

    const { data: newTodoData, error: insertError } = await (await supabase)
      .from("todos")
      .insert([nextTodoToInsert])
      .select();

        if (insertError || !newTodoData || newTodoData.length === 0) {
      console.error("Failed to insert next recurring todo:", insertError?.message);
      return;
    }

    updatedTodos = [newTodoData[0], ...updatedTodos];
  }
    setTodos(updatedTodos);
  }

  const toggleStar = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, starred: !todo.starred } : todo)))
  }

  const getCurrentDate = () => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
    return today.toLocaleDateString("en-US", options)
  }

  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      <div className="px-3 pt-3 pb-2">
        <h1 className="text-2xl font-light mb-1 text-balance">My Day</h1>
        <p className="text-muted-foreground text-xs">{getCurrentDate()}</p>
        {onOpenJournal && (
          <div className="mt-2">
            <button
              onClick={onOpenJournal}
              className="h-8 px-3 text-xs rounded-md border bg-background hover:bg-muted transition-colors"
              aria-label="Open Journal"
              title="Open Journal"
            >
              Journal MyDay
            </button>
          </div>
        )}
      </div>

      <div className="px-3 space-y-2">
        {pendingTodos.map((todo) => (
          <Card key={todo.id} className="bg-card border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-foreground transition-colors flex items-center justify-center flex-shrink-0"
                  aria-label="Toggle complete"
                >
                  {todo.completed && <div className="w-2.5 h-2.5 bg-foreground rounded-full"></div>}
                </button>
                <div className="flex-1 min-w-0">
                  {editingId === todo.id ? (
                    <div className="space-y-2">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        />
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="low">Low priority</option>
                          <option value="medium">Medium priority</option>
                          <option value="high">High priority</option>
                        </select>
                        <input
                          placeholder="tags (comma separated)"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-xs col-span-2"
                        />
                        <input
                          placeholder="project/list"
                          value={editProject}
                          onChange={(e) => setEditProject(e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-xs col-span-2"
                        />
                        <select
                          value={editRecurring}
                          onChange={(e) => setEditRecurring(e.target.value as any)}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="none">No repeat</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="custom">Custom</option>
                        </select>
                        {editRecurring === "custom" && (
                          <input
                            type="number"
                            min={1}
                            value={editIntervalDays}
                            onChange={(e) => setEditIntervalDays(Number.parseInt(e.target.value || "1", 10))}
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            placeholder="Every N days"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-8 text-xs" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs bg-transparent"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium">{todo.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        {todo.project || "Tasks"}
                        {todo.due_date ? ` • Due ${todo.due_date}` : ""}
                        {todo.priority ? ` • ${todo.priority}` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleStar(todo.id)}
                  className={`p-1 flex-shrink-0 ${todo.starred ? "text-yellow-500" : "text-muted-foreground"} hover:text-yellow-500 transition-colors`}
                  aria-label="Toggle star"
                >
                  <Star className="h-4 w-4" fill={todo.starred ? "currentColor" : "none"} />
                </button>
                {editingId !== todo.id ? (
                  <>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => startEdit(todo)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => deleteTodo(todo.id)}>
                      Delete
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {completedTodos.length > 0 && (
        <div className="pt-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-muted-foreground mb-2 hover:text-foreground transition-colors"
          >
            {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            <span className="text-sm">Completed {completedTodos.length}</span>
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <Card key={todo.id} className="bg-muted/50 border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
                      >
                        <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full"></div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium line-through text-muted-foreground">{todo.title}</h3>
                        <p className="text-muted-foreground/60 text-xs">
                          {todo.project || "Tasks"}
                          {todo.due_date ? ` • Due ${todo.due_date}` : ""}
                          {todo.priority ? ` • ${todo.priority}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStar(todo.id)}
                      className={`p-1 flex-shrink-0 ${todo.starred ? "text-yellow-500/60" : "text-muted-foreground/60"} hover:text-yellow-500/60 transition-colors`}
                    >
                      <Star className="h-4 w-4" fill={todo.starred ? "currentColor" : "none"} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-x-3 bottom-24 mx-auto max-w-md bg-background border-t p-3 rounded-xl shadow-sm">
        {!isAddingTodo ? (
          <button
            onClick={() => setIsAddingTodo(true)}
            className="w-full bg-muted border-none p-3 rounded-lg flex items-center gap-2.5 hover:bg-muted/80 transition-colors"
            aria-label="Add a task"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add a task</span>
          </button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Enter task title"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="bg-background text-sm h-9"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label="Due date"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label="Priority"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <input
                placeholder="tags (comma separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs col-span-2"
                aria-label="Tags"
              />
              <input
                placeholder="project/list"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs col-span-2"
                aria-label="Project"
              />
              <select
                value={newRecurring}
                onChange={(e) => setNewRecurring(e.target.value as any)}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label="Recurring"
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              {newRecurring === "custom" && (
                <input
                  type="number"
                  min={1}
                  value={newIntervalDays}
                  onChange={(e) => setNewIntervalDays(Number.parseInt(e.target.value || "1", 10))}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                  placeholder="Every N days"
                  aria-label="Custom repeat days"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={addTodo} size="sm" className="flex-1 h-8 text-xs">
                Add Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingTodo(false)
                  setNewTodoTitle("")
                  setNewDueDate("")
                  setNewPriority("medium")
                  setNewTags("")
                  setNewProject("My Day")
                  setNewRecurring("none")
                  setNewIntervalDays(2)
                }}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="h-40"></div>
    </div>
  )
}
