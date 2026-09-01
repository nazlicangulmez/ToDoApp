import readline from "readline/promises";
import { pool } from "./db/connection.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const STATUS_LABELS = {
    pending: "[ ]",
    in_progress: "[~]",
    done: "[x]",
};

const addTodo = async (userId, title) => {
    await pool.query(
        "INSERT INTO todos (title, user_id) VALUES ($1, $2)",
        [title, userId]
    );
    console.log("eklendi.");
};

const listTodos = async (userId) => {
    const result = await pool.query(
        "SELECT * FROM todos WHERE user_id = $1 ORDER BY id",
        [userId]
    );
    const todos = result.rows;

    if (todos.length === 0) {
        console.log("henüz görev yok.");
        return;
    }

    todos.forEach((todo) => {
        const mark = STATUS_LABELS[todo.status] ?? "[?]";
        console.log(`${todo.id}. ${mark} ${todo.title}`);
    });
};

const markDone = async (userId, id) => {
    const result = await pool.query(
        "UPDATE todos SET status = 'done' WHERE id = $1 AND user_id = $2",
        [id, userId]
    );

    if (result.rowCount === 0) {
        console.log("böyle bir görev yok.");
        return;
    }
    console.log("tamamlandı olarak işaretlendi.");
};

const deleteTodo = async (userId, id) => {
    const result = await pool.query(
        "DELETE FROM todos WHERE id = $1 AND user_id = $2",
        [id, userId]
    );

    if (result.rowCount === 0) {
        console.log("böyle bir görev yok.");
        return;
    }
    console.log("silindi.");
};

const showMenu = () => {
    console.log("\n--- TODO ---");
    console.log("1. Görev ekle");
    console.log("2. Görevleri listele");
    console.log("3. Görevi tamamla");
    console.log("4. Görev sil");
    console.log("5. Çıkış");
};

const email = await rl.question("e-postan: ");
const userResult = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
);

if (userResult.rowCount === 0) {
    console.log("böyle bir kullanıcı yok. önce web arayüzünden kayıt ol.");
    rl.close();
    await pool.end();
    process.exit(0);
}

const userId = userResult.rows[0].id;

let running = true;

while (running) {
    showMenu();
    const choice = await rl.question("seçimin: ");

    if (choice === "1") {
        const title = await rl.question("görev başlığı: ");
        await addTodo(userId, title);
    } else if (choice === "2") {
        await listTodos(userId);
    } else if (choice === "3") {
        const id = await rl.question("hangi id? ");
        await markDone(userId, Number(id));
    } else if (choice === "4") {
        const id = await rl.question("hangi id silinsin? ");
        await deleteTodo(userId, Number(id));
    } else if (choice === "5") {
        running = false;
    } else {
        console.log("geçersiz seçim.");
    }
}

rl.close();
await pool.end();
console.log("görüşürüz.");