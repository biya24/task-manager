import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  // Modal for editing
  const [editingTask, setEditingTask] = useState<{ id: string; title: string } | null>(null);
  const [editingText, setEditingText] = useState("");

  // Load tasks from AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem("@tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage
  const saveTasks = async (newTasks: typeof tasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem("@tasks", JSON.stringify(newTasks));
  };

  // Add task
  const addTask = () => {
    if (!task.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTasks = [...tasks, { id: Date.now().toString(), title: task, completed: false }];
    saveTasks(newTasks);
    setTask("");
  };

  // Delete task
  const deleteTask = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTasks = tasks.filter((t) => t.id !== id);
    saveTasks(newTasks);
  };

  // Toggle completed
  const toggleCompleted = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(newTasks);
  };

  // Open edit modal
  const startEditing = (task: { id: string; title: string }) => {
    setEditingTask(task);
    setEditingText(task.title);
  };

  // Save edited task
  const saveEdit = () => {
    if (!editingText.trim() || !editingTask) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTasks = tasks.map((t) =>
      t.id === editingTask.id ? { ...t, title: editingText } : t
    );
    saveTasks(newTasks);
    setEditingTask(null);
    setEditingText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Task Manager</Text>

      {/* Input + Add Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          placeholderTextColor="#888"
          value={task}
          onChangeText={setTask}
        />
        <Pressable style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => toggleCompleted(item.id)}
              onLongPress={() => startEditing(item)}
            >
              <Text style={[styles.taskText, item.completed && styles.completed]}>
                {item.title}
              </Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Edit Modal */}
      {editingTask && (
        <Modal
          transparent
          animationType="slide"
          visible={!!editingTask}
          onRequestClose={() => setEditingTask(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={{ fontSize: 18, marginBottom: 10 }}>Edit Task</Text>
              <TextInput
                style={styles.modalInput}
                value={editingText}
                onChangeText={setEditingText}
                placeholder="Update task"
              />
              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <Pressable
                  style={[styles.addButton, { flex: 1, marginRight: 5, backgroundColor: "#888" }]}
                  onPress={() => setEditingTask(null)}
                >
                  <Text style={styles.addButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
                  onPress={saveEdit}
                >
                  <Text style={styles.addButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50, backgroundColor: "#f5f5f5" },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333", textAlign: "center" },
  inputContainer: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  task: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskText: { fontSize: 16, color: "#333", flexShrink: 1 },
  completed: { textDecorationLine: "line-through", color: "#888" },
  deleteButton: {
    backgroundColor: "#F44336",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    color: "#000",
  },
});
