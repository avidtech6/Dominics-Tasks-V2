# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Something went wrong" [level=2] [ref=e4]
  - paragraph [ref=e6]:
    - strong [ref=e7]: "Error:"
    - text: "taskBehaviour.subscribe is not a function. (In 'taskBehaviour.subscribe((event) => { if (event.type === \"task_created\" || event.type === \"task_updated\" || event.type === \"task_deleted\") { const loadTasks = async () => { try { const allTasks2 = await taskBehaviour.getTasks(); setTasks(allTasks2); } catch (error) { console.error(\"Error reloading tasks:\", error); } }; loadTasks(); } })', 'taskBehaviour.subscribe' is undefined)"
  - group [ref=e8]:
    - generic "Show technical details" [ref=e9] [cursor=pointer]
  - button "Reload Page" [ref=e10] [cursor=pointer]
```