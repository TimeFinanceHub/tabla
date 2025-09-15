document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Función para renderizar una tarea en el DOM
    const renderTodo = (todo) => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.dataset.id = todo.id;
        if (todo.completed) {
            li.classList.add('completed');
        }

        const taskText = document.createElement('span');
        taskText.textContent = todo.task;
        taskText.classList.add('task-text');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.title = 'Marcar como completada';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Eliminar tarea';

        buttonContainer.appendChild(completeBtn);
        buttonContainer.appendChild(deleteBtn);
        li.appendChild(taskText);
        li.appendChild(buttonContainer);
        todoList.prepend(li); // Agrega la tarea al principio de la lista
    };

    // Cargar tareas al inicio
    const fetchTodos = async () => {
        const res = await fetch('/home/timeziej/syntaxsanctuary.com/p4ws/api/todo.php');
        const data = await res.json();
        data.data.forEach(todo => renderTodo(todo));
    };

    // Agregar una nueva tarea
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const task = todoInput.value.trim();
        if (!task) return;

        const res = await fetch('/home/timeziej/syntaxsanctuary.com/p4ws/api/todo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task })
        });
        const data = await res.json();
        if (data.success) {
            renderTodo({ id: data.id, task: task, completed: 0 });
            todoInput.value = '';
        }
    });

    // Eliminar o completar tarea
    todoList.addEventListener('click', async (e) => {
        const item = e.target.closest('li');
        if (!item) return;

        const id = item.dataset.id;
        if (e.target.closest('.delete-btn')) {
            const res = await fetch('/home/timeziej/syntaxsanctuary.com/p4ws/api/todo.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                item.remove();
            }
        } else if (e.target.closest('.complete-btn')) {
            const res = await fetch('/home/timeziej/syntaxsanctuary.com/p4ws/api/todo.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                item.classList.toggle('completed');
            }
        }
    });

    fetchTodos();
});