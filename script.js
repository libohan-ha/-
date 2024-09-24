document.addEventListener('DOMContentLoaded', () => {
    const newTaskBtn = document.getElementById('new-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeButton = document.querySelector('.close-button');
    const taskForm = document.getElementById('task-form');
    const tasksContainer = document.getElementById('tasks-container');
    const checkInBtn = document.getElementById('check-in-btn');
    const checkInCountDisplay = document.getElementById('check-in-count'); // 显示打卡天数的元素
    const modalTitle = document.getElementById('modal-title');

    let editTaskId = null;

    // 单击相关变量
    let clickTimer = null;
    const clickDelay = 300; // 单击与双击的时间间隔

    // 长按相关变量
    let pressTimer = null;
    const longPressDuration = 500; // 长按判定时间（毫秒）

    // 打开模态框
    newTaskBtn.addEventListener('click', () => {
        openModal();
    });

    // 关闭模态框
    closeButton.addEventListener('click', () => {
        closeModal();
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target == taskModal) {
            closeModal();
        }
    });

    // 提交任务表单
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value.trim();
        const desc = document.getElementById('task-desc').value.trim();

        if (title === '') {
            alert('任务标题不能为空！');
            return;
        }

        if (editTaskId) {
            updateTask(editTaskId, title, desc);
        } else {
            addTask(title, desc);
        }

        closeModal();
        taskForm.reset();
    });

    // 新增任务
    function addTask(title, desc) {
        const task = {
            id: Date.now(),
            title,
            desc
        };
        saveTask(task);
        renderTask(task);
    }

    // 保存任务到本地存储
    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 更新任务
    function updateTask(id, title, desc) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => task.id === id ? { id, title, desc } : task);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // 更新DOM
        const taskCard = document.querySelector(`[data-id='${id}']`);
        if (taskCard) {
            taskCard.querySelector('h3').textContent = title;
            taskCard.querySelector('p').textContent = desc;
        }
    }

    // 删除任务
    function deleteTask(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // 移除DOM
        const taskCard = document.querySelector(`[data-id='${id}']`);
        if (taskCard) {
            taskCard.classList.add('fade-out');
            taskCard.addEventListener('transitionend', () => {
                taskCard.remove();
            });
        }
    }

    // 渲染任务到页面
    function renderTask(task) {
        const card = document.createElement('div');
        card.classList.add('task-card');
        card.setAttribute('data-id', task.id);

        card.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.desc}</p>
            <button class="complete-btn">DO</button>
        `;

        // 完成按钮事件
        const completeBtn = card.querySelector('.complete-btn');
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        // 点击卡片编辑任务
        card.addEventListener('click', () => {
            openModal(task);
        });

        tasksContainer.appendChild(card);
    }

    // 加载任务
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => renderTask(task));
    }

    // 打卡功能
    checkInBtn.addEventListener('click', (e) => {
        // 使用单击延迟处理，以避免与双击事件冲突
        if (clickTimer == null) {
            clickTimer = setTimeout(() => {
                handleSingleClick();
                clickTimer = null;
            }, clickDelay);
        }
    });

    // 双击打卡键，打卡天数减一
    checkInBtn.addEventListener('dblclick', (e) => {
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }
        handleDoubleClick();
    });

    // 长按打卡键，打卡天数归零
    // 处理鼠标事件
    checkInBtn.addEventListener('mousedown', (e) => {
        pressTimer = setTimeout(() => {
            handleLongPress();
        }, longPressDuration);
    });

    checkInBtn.addEventListener('mouseup', (e) => {
        clearTimeout(pressTimer);
    });

    checkInBtn.addEventListener('mouseleave', (e) => {
        clearTimeout(pressTimer);
    });

    // 处理触摸事件
    checkInBtn.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            handleLongPress();
        }, longPressDuration);
    });

    checkInBtn.addEventListener('touchend', (e) => {
        clearTimeout(pressTimer);
    });

    // 单击处理函数
    function handleSingleClick() {
        // 读取本地存储中的打卡天数
        let checkInDays = JSON.parse(localStorage.getItem('checkInDays')) || 0;
        
        // 增加打卡天数
        checkInDays++;
        
        // 更新本地存储
        localStorage.setItem('checkInDays', JSON.stringify(checkInDays));
        
        // 动态更新页面显示的打卡天数
        checkInCountDisplay.textContent = `已打卡 ${checkInDays} 天`;

        // 打卡成功的动画效果
        checkInBtn.classList.add('check-in-animation');
        setTimeout(() => {
            checkInBtn.classList.remove('check-in-animation');
        }, 1000);
    }

    // 双击处理函数
    function handleDoubleClick() {
        let checkInDays = JSON.parse(localStorage.getItem('checkInDays')) || 0;
        
        if (checkInDays > 0) {
            checkInDays--;
            localStorage.setItem('checkInDays', JSON.stringify(checkInDays));
            checkInCountDisplay.textContent = `已打卡 ${checkInDays} 天`;

            // 双击减一的动画效果
            checkInBtn.classList.add('decrease-animation');
            setTimeout(() => {
                checkInBtn.classList.remove('decrease-animation');
            }, 1000);
        } else {
            alert('打卡天数已为零，无法减少！');
        }
    }

    // 长按处理函数（已移除确认对话框）
    function handleLongPress() {
        localStorage.setItem('checkInDays', JSON.stringify(0));
        checkInCountDisplay.textContent = `已打卡 0 天`;

        // 长按归零的动画效果
        checkInBtn.classList.add('reset-animation');
        setTimeout(() => {
            checkInBtn.classList.remove('reset-animation');
        }, 1000);
    }

    // 加载打卡天数
    function loadCheckInDays() {
        let checkInDays = JSON.parse(localStorage.getItem('checkInDays')) || 0;
        checkInCountDisplay.textContent = `已打卡 ${checkInDays} 天`;
    }

    // 打开模态框
    function openModal(task = null) {
        taskModal.style.display = 'block';
        if (task) {
            modalTitle.textContent = '编辑任务';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.desc;
            editTaskId = task.id;
        } else {
            modalTitle.textContent = '新建任务';
            editTaskId = null;
        }
    }

    // 关闭模态框
    function closeModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
        editTaskId = null;
    }

    // 初始化
    loadTasks();
    loadCheckInDays(); // 页面加载时加载打卡天数
});
