/**
 * TaskFlow Pro - Professional Task Management Application
 * ========================================================
 * Main JavaScript File - Complete Functionality
 * Author: MiniMax Agent
 * Version: 2.0
 */

// ============================================
// التخزين المحلي وإدارة البيانات
// ============================================

const StorageManager = {
    // حفظ البيانات في التخزين المحلي
    save(key, data) {
        try {
            localStorage.setItem(`taskflow_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    },

    // استرجاع البيانات من التخزين المحلي
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`taskflow_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('خطأ في قراءة البيانات:', error);
            return defaultValue;
        }
    },

    // حذف البيانات
    remove(key) {
        try {
            localStorage.removeItem(`taskflow_${key}`);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    },

    // مسح جميع البيانات
    clearAll() {
        const keys = ['tasks', 'projects', 'team', 'settings', 'user'];
        keys.forEach(key => this.remove(key));
    }
};

// ============================================
// إدارة الإشعارات
// ============================================

const NotificationManager = {
    notifications: [],
    
    init() {
        this.notifications = StorageManager.load('notifications', this.getDefaultNotifications());
        this.render();
    },
    
    getDefaultNotifications() {
        return [
            {
                id: 1,
                type: 'task',
                title: 'مهمة جديدة مُضافة',
                message: 'تم إضافة مهمة "تحديث التقرير الأسبوعي" بنجاح',
                time: 'منذ 5 دقائق',
                read: false
            },
            {
                id: 2,
                type: 'comment',
                title: 'تعليق جديد',
                message: 'أحمد علّاش على مهمة "تصميم الواجهة"',
                time: 'منذ ساعة',
                read: false
            },
            {
                id: 3,
                type: 'project',
                title: 'تحديث المشروع',
                message: 'تم تحديث حالة مشروع "تطبيق الجوال"',
                time: 'منذ ساعتين',
                read: false
            }
        ];
    },
    
    add(notification) {
        const newNotification = {
            id: Date.now(),
            time: 'الآن',
            read: false,
            ...notification
        };
        this.notifications.unshift(newNotification);
        StorageManager.save('notifications', this.notifications);
        this.render();
        this.updateCount();
    },
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            StorageManager.save('notifications', this.notifications);
            this.render();
            this.updateCount();
        }
    },
    
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        StorageManager.save('notifications', this.notifications);
        this.render();
        this.updateCount();
    },
    
    updateCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notification-count');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    },
    
    render() {
        const container = document.getElementById('notifications-list');
        if (!container) return;
        
        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${this.getIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h5>${notification.title}</h5>
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            </div>
        `).join('');
        
        // إضافة مستمعي الأحداث
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
            });
        });
    },
    
    getIcon(type) {
        const icons = {
            task: 'tasks',
            comment: 'comment',
            project: 'project-diagram',
            user: 'user'
        };
        return icons[type] || 'bell';
    }
};

// ============================================
// إدارة المشاريع
// ============================================

const ProjectManager = {
    projects: [],
    
    init() {
        this.projects = StorageManager.load('projects', this.getSampleProjects());
        this.renderProjectsList();
        this.renderProjectsGrid();
        this.renderKanbanFilter();
    },
    
    getSampleProjects() {
        return [
            {
                id: 1,
                name: 'تطوير تطبيق الجوال',
                description: 'تطوير تطبيق جوال متكامل لادارة المهام والمشاريع',
                color: '#4a90d9',
                deadline: '2025-03-15',
                tasks: [
                    { id: 1, title: 'تصميم واجهة المستخدم', status: 'completed' },
                    { id: 2, title: 'برمجة الشاشة الرئيسية', status: 'in-progress' },
                    { id: 3, title: 'اختبار الأداء', status: 'pending' }
                ]
            },
            {
                id: 2,
                name: 'مشروع الموقع الإلكتروني',
                description: 'إعادة تصميم وتطوير الموقع الإلكتروني للشركة',
                color: '#28a745',
                deadline: '2025-02-28',
                tasks: [
                    { id: 4, title: 'تحليل المتطلبات', status: 'completed' },
                    { id: 5, title: 'تصميم الهوية البصرية', status: 'completed' }
                ]
            },
            {
                id: 3,
                name: 'حملة التسويق الرقمي',
                description: 'تنفيذ حملة تسويقية شاملة للمنتجات الجديدة',
                color: '#fd7e14',
                deadline: '2025-04-01',
                tasks: [
                    { id: 6, title: 'وضع الاستراتيجية', status: 'in-progress' }
                ]
            }
        ];
    },
    
    add(project) {
        const newProject = {
            id: Date.now(),
            tasks: [],
            ...project
        };
        this.projects.push(newProject);
        StorageManager.save('projects', this.projects);
        this.renderProjectsList();
        this.renderProjectsGrid();
        this.renderKanbanFilter();
        return newProject;
    },
    
    update(id, updates) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updates };
            StorageManager.save('projects', this.projects);
            this.renderProjectsList();
            this.renderProjectsGrid();
            this.renderKanbanFilter();
            return true;
        }
        return false;
    },
    
    delete(id) {
        this.projects = this.projects.filter(p => p.id !== id);
        StorageManager.save('projects', this.projects);
        this.renderProjectsList();
        this.renderProjectsGrid();
        this.renderKanbanFilter();
    },
    
    getProject(id) {
        return this.projects.find(p => p.id === id);
    },
    
    getProjectName(id) {
        const project = this.getProject(id);
        return project ? project.name : 'بدون مشروع';
    },
    
    renderProjectsList() {
        const select = document.getElementById('task-filter-project');
        const taskProjectSelect = document.getElementById('task-project-select');
        const kanbanFilter = document.getElementById('kanban-project-filter');
        
        if (select) {
            select.innerHTML = '<option value="all">جميع المشاريع</option>' +
                this.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
        
        if (taskProjectSelect) {
            taskProjectSelect.innerHTML = '<option value="">اختر المشروع</option>' +
                this.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
        
        if (kanbanFilter) {
            kanbanFilter.innerHTML = '<option value="all">جميع المشاريع</option>' +
                this.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    },
    
    renderProjectsGrid() {
        const grid = document.getElementById('projects-grid');
        const empty = document.getElementById('empty-projects');
        
        if (!grid) return;
        
        if (this.projects.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.classList.add('show');
            return;
        }
        
        if (empty) empty.classList.remove('show');
        
        grid.innerHTML = this.projects.map(project => {
            const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return `
                <div class="project-card" data-id="${project.id}">
                    <div class="project-header">
                        <div class="project-color-bar" style="background: linear-gradient(135deg, ${project.color}, ${project.color}dd)"></div>
                        <div class="project-actions-overlay">
                            <button onclick="ProjectManager.editProject(${project.id})" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="ProjectManager.deleteProject(${project.id})" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="project-body">
                        <h3 class="project-title">${project.name}</h3>
                        <p class="project-description">${project.description || 'لا يوجد وصف'}</p>
                        <div class="project-meta">
                            <div class="project-progress">
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span class="project-progress-text">${progress}%</span>
                            </div>
                            <span class="project-tasks-count">${totalTasks} مهام</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderKanbanFilter() {
        // تم التعامل معه في renderProjectsList
    },
    
    editProject(id) {
        const project = this.getProject(id);
        if (!project) return;
        
        document.getElementById('project-id').value = id;
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-color').value = project.color;
        document.getElementById('project-deadline').value = project.deadline || '';
        document.getElementById('project-modal-title').textContent = 'تعديل المشروع';
        
        ModalManager.open('project-modal');
    },
    
    deleteProject(id) {
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
            this.delete(id);
            ToastManager.show('تم حذف المشروع بنجاح', 'success');
        }
    }
};

// ============================================
// إدارة المهام
// ============================================

const TaskManager = {
    tasks: [],
    
    init() {
        this.tasks = StorageManager.load('tasks', this.getSampleTasks());
        this.renderTasksList();
        this.renderKanbanBoard();
        this.renderDashboard();
        this.renderCalendar();
    },
    
    getSampleTasks() {
        return [
            {
                id: 1,
                title: 'إعداد التقرير الأسبوعي',
                description: 'إعداد تقرير شامل عن أداء الفريق خلال الأسبوع',
                projectId: 1,
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-01-20',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'مراجعة التصميمات',
                description: 'مراجعة واعتماد التصميمات الجديدة للتطبيق',
                projectId: 1,
                priority: 'medium',
                status: 'pending',
                dueDate: '2025-01-22',
                featured: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'اختبار الوظائف',
                description: 'اختبار جميع وظائف التطبيق والتحقق من عدم وجود أخطاء',
                projectId: 1,
                priority: 'high',
                status: 'pending',
                dueDate: '2025-01-25',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: 'تحديث الوثائق',
                description: 'تحديث وثائق المستخدم والتطوير',
                projectId: 2,
                priority: 'low',
                status: 'completed',
                dueDate: '2025-01-18',
                featured: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'اجتماع مع الفريق',
                description: 'اجتماع أسبوعي لمناقشة التقدم والمشاكل',
                projectId: 2,
                priority: 'medium',
                status: 'pending',
                dueDate: '2025-01-21',
                featured: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: 'إعداد الميزانية',
                description: 'إعداد ميزانية المشروع للربع القادم',
                projectId: 3,
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-01-23',
                featured: true,
                createdAt: new Date().toISOString()
            }
        ];
    },
    
    add(task) {
        const newTask = {
            id: Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...task
        };
        this.tasks.push(newTask);
        StorageManager.save('tasks', this.tasks);
        this.renderAll();
        return newTask;
    },
    
    update(id, updates) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date().toISOString() };
            StorageManager.save('tasks', this.tasks);
            this.renderAll();
            return true;
        }
        return false;
    },
    
    delete(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        StorageManager.save('tasks', this.tasks);
        this.renderAll();
    },
    
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            StorageManager.save('tasks', this.tasks);
            this.renderAll();
        }
    },
    
    getTask(id) {
        return this.tasks.find(t => t.id === id);
    },
    
    getFilteredTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        if (filters.project && filters.project !== 'all') {
            filtered = filtered.filter(t => t.projectId == filters.project);
        }
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(t => t.priority === filters.priority);
        }
        
        return filtered;
    },
    
    renderAll() {
        this.renderTasksList();
        this.renderKanbanBoard();
        this.renderDashboard();
        this.renderCalendar();
    },
    
    renderTasksList() {
        const container = document.getElementById('tasks-list');
        const empty = document.getElementById('empty-tasks');
        
        if (!container) return;
        
        const projectFilter = document.getElementById('task-filter-project')?.value || 'all';
        const statusFilter = document.getElementById('task-filter-status')?.value || 'all';
        const priorityFilter = document.getElementById('task-filter-priority')?.value || 'all';
        
        const tasks = this.getFilteredTasks({
            project: projectFilter,
            status: statusFilter,
            priority: priorityFilter
        });
        
        if (tasks.length === 0) {
            container.innerHTML = '';
            if (empty) empty.classList.add('show');
            return;
        }
        
        if (empty) empty.classList.remove('show');
        
        container.innerHTML = tasks.map(task => `
            <div class="task-row ${task.status}" data-id="${task.id}">
                <div class="task-checkbox" onclick="TaskManager.toggleComplete(${task.id})">
                    ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-row-title">${task.title}</div>
                <div class="task-project">${ProjectManager.getProjectName(task.projectId)}</div>
                <div class="task-priority">
                    <span class="task-priority-badge ${task.priority}">
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </div>
                <div class="task-due-date">${this.formatDate(task.dueDate)}</div>
                <div class="task-status">
                    <span class="task-priority-badge ${task.status}">
                        ${this.getStatusLabel(task.status)}
                    </span>
                </div>
                <div class="task-row-actions">
                    <button onclick="TaskManager.viewTask(${task.id})" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="TaskManager.editTask(${task.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete" onclick="TaskManager.deleteTask(${task.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderKanbanBoard() {
        const projectFilter = document.getElementById('kanban-project-filter')?.value || 'all';
        
        const tasks = this.getFilteredTasks({ project: projectFilter });
        
        const columns = {
            pending: document.getElementById('kanban-pending'),
            'in-progress': document.getElementById('kanban-in-progress'),
            completed: document.getElementById('kanban-completed')
        };
        
        Object.keys(columns).forEach(status => {
            if (!columns[status]) return;
            
            const statusTasks = tasks.filter(t => t.status === status);
            
            columns[status].innerHTML = statusTasks.map(task => `
                <div class="kanban-card" draggable="true" data-id="${task.id}">
                    <div class="kanban-card-title">${task.title}</div>
                    <div class="kanban-card-meta">
                        <span class="kanban-card-project">${ProjectManager.getProjectName(task.projectId)}</span>
                        <span class="task-priority-badge ${task.priority}">
                            ${this.getPriorityLabel(task.priority)}
                        </span>
                    </div>
                </div>
            `).join('');
            
            // تحديث عداد المهام
            const column = columns[status].closest('.kanban-column');
            if (column) {
                column.querySelector('.task-count').textContent = statusTasks.length;
            }
        });
        
        this.initKanbanDragDrop();
    },
    
    initKanbanDragDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.column-content');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(column, e.clientY);
                const draggable = document.querySelector('.dragging');
                if (afterElement == null) {
                    column.appendChild(draggable);
                } else {
                    column.insertBefore(draggable, afterElement);
                }
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.id.replace('kanban-', '');
                this.update(taskId, { status: newStatus });
            });
        });
    },
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    
    renderDashboard() {
        // تحديث الإحصائيات
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const pendingTasks = this.tasks.filter(t => t.status !== 'completed').length;
        const totalProjects = ProjectManager.projects.length;
        
        const totalEl = document.getElementById('total-tasks');
        const completedEl = document.getElementById('completed-tasks');
        const pendingEl = document.getElementById('pending-tasks');
        const projectsEl = document.getElementById('total-projects');
        
        if (totalEl) totalEl.textContent = totalTasks;
        if (completedEl) completedEl.textContent = completedTasks;
        if (pendingEl) pendingEl.textContent = pendingTasks;
        if (projectsEl) projectsEl.textContent = totalProjects;
        
        // تحديث شريط التقدم
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const progressFill = document.getElementById('progress-fill');
        const completionPercent = document.getElementById('completion-percentage');
        
        if (progressFill) progressFill.style.width = `${completionPercentage}%`;
        if (completionPercent) completionPercent.textContent = `${completionPercentage}%`;
        
        // المهام المميزة
        const featuredTasks = this.tasks.filter(t => t.featured).slice(0, 5);
        const featuredContainer = document.getElementById('featured-tasks');
        
        if (featuredContainer) {
            featuredContainer.innerHTML = featuredTasks.map(task => `
                <li class="task-item ${task.status}" onclick="TaskManager.viewTask(${task.id})">
                    <div class="task-checkbox" onclick="event.stopPropagation(); TaskManager.toggleComplete(${task.id})">
                        ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <span class="task-text">${task.title}</span>
                    <span class="task-priority-badge ${task.priority}">
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </li>
            `).join('');
        }
        
        // مهام اليوم
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => t.dueDate === today).slice(0, 5);
        const todayContainer = document.getElementById('today-tasks');
        
        if (todayContainer) {
            todayContainer.innerHTML = todayTasks.length > 0 ? todayTasks.map(task => `
                <li class="task-item ${task.status}" onclick="TaskManager.viewTask(${task.id})">
                    <div class="task-checkbox" onclick="event.stopPropagation(); TaskManager.toggleComplete(${task.id})">
                        ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <span class="task-text">${task.title}</span>
                </li>
            `).join('') : '<li style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد مهام اليوم</li>';
        }
        
        // توزيع الأولويات
        const highCount = this.tasks.filter(t => t.priority === 'high').length;
        const mediumCount = this.tasks.filter(t => t.priority === 'medium').length;
        const lowCount = this.tasks.filter(t => t.priority === 'low').length;
        const total = highCount + mediumCount + lowCount || 1;
        
        const highBar = document.getElementById('high-priority-bar');
        const mediumBar = document.getElementById('medium-priority-bar');
        const lowBar = document.getElementById('low-priority-bar');
        
        if (highBar) highBar.style.width = `${(highCount / total) * 100}%`;
        if (mediumBar) mediumBar.style.width = `${(mediumCount / total) * 100}%`;
        if (lowBar) lowBar.style.width = `${(lowCount / total) * 100}%`;
        
        document.getElementById('high-priority-count').textContent = highCount;
        document.getElementById('medium-priority-count').textContent = mediumCount;
        document.getElementById('low-priority-count').textContent = lowCount;
    },
    
    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;
        
        const now = new Date();
        const currentMonth = parseInt(window.currentMonth || now.getMonth());
        const currentYear = parseInt(window.currentYear || now.getFullYear());
        
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        let html = '';
        
        // أيام الشهر السابق
        for (let i = firstDay - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month"><div class="calendar-day-number">${daysInPrevMonth - i}</div></div>`;
        }
        
        // أيام الشهر الحالي
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = this.tasks.filter(t => t.dueDate === dateStr);
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    <div class="calendar-day-number">${day}</div>
                    <div class="calendar-tasks">
                        ${dayTasks.slice(0, 2).map(task => `
                            <div class="calendar-task ${task.status} ${task.priority}" title="${task.title}">
                                ${task.title}
                            </div>
                        `).join('')}
                        ${dayTasks.length > 2 ? `<div class="calendar-task" style="background: var(--bg-tertiary);">+${dayTasks.length - 2} أخرى</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // أيام الشهر القادم
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            html += `<div class="calendar-day other-month"><div class="calendar-day-number">${i}</div></div>`;
        }
        
        grid.innerHTML = html;
    },
    
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
    },
    
    getPriorityLabel(priority) {
        const labels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
        return labels[priority] || priority;
    },
    
    getStatusLabel(status) {
        const labels = { pending: 'قيد الانتظار', 'in-progress': 'قيد العمل', completed: 'مكتمل' };
        return labels[status] || status;
    },
    
    editTask(id) {
        const task = this.getTask(id);
        if (!task) return;
        
        document.getElementById('task-id').value = id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-project-select').value = task.projectId || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-featured').checked = task.featured || false;
        document.getElementById('task-modal-title').textContent = 'تعديل المهمة';
        
        ModalManager.open('task-modal');
    },
    
    viewTask(id) {
        const task = this.getTask(id);
        if (!task) return;
        
        const content = document.getElementById('task-details-content');
        content.innerHTML = `
            <div class="task-detail-header">
                <h2 class="task-detail-title">${task.title}</h2>
                <span class="task-priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
            </div>
            <div class="task-detail-meta">
                <span><i class="fas fa-project-diagram"></i> ${ProjectManager.getProjectName(task.projectId)}</span>
                <span><i class="fas fa-flag"></i> ${this.getPriorityLabel(task.priority)}</span>
                <span><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>
                <span class="task-priority-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
            </div>
            <div class="task-detail-description">
                <h4>الوصف</h4>
                <p>${task.description || 'لا يوجد وصف لهذه المهمة'}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="ModalManager.close('task-details-modal')">إغلاق</button>
                <button class="btn btn-primary" onclick="TaskManager.editTask(${task.id}); ModalManager.close('task-details-modal');">
                    <i class="fas fa-edit"></i>
                    <span>تعديل</span>
                </button>
            </div>
        `;
        
        ModalManager.open('task-details-modal');
    },
    
    deleteTask(id) {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            this.delete(id);
            ToastManager.show('تم حذف المهمة بنجاح', 'success');
        }
    }
};

// ============================================
// إدارة الفريق
// ============================================

const TeamManager = {
    members: [],
    
    init() {
        this.members = StorageManager.load('team', this.getSampleMembers());
        this.renderTeamGrid();
    },
    
    getSampleMembers() {
        return [
            {
                id: 1,
                name: 'أحمد محمد',
                role: 'مطور أمامي',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
                tasksCompleted: 45,
                tasksInProgress: 5
            },
            {
                id: 2,
                name: 'سارة علي',
                role: 'مصممة',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                tasksCompleted: 38,
                tasksInProgress: 8
            },
            {
                id: 3,
                name: 'خالد عمر',
                role: 'مطور خلفي',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
                tasksCompleted: 52,
                tasksInProgress: 3
            }
        ];
    },
    
    add(member) {
        const newMember = {
            id: Date.now(),
            tasksCompleted: 0,
            tasksInProgress: 1,
            ...member
        };
        this.members.push(newMember);
        StorageManager.save('team', this.members);
        this.renderTeamGrid();
        return newMember;
    },
    
    renderTeamGrid() {
        const grid = document.getElementById('team-grid');
        const empty = document.getElementById('empty-team');
        
        if (!grid) return;
        
        if (this.members.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.classList.add('show');
            return;
        }
        
        if (empty) empty.classList.remove('show');
        
        grid.innerHTML = this.members.map((member, index) => `
            <div class="team-member-card">
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-role">${member.role}</p>
                <div class="member-stats">
                    <div class="member-stat">
                        <div class="member-stat-value">${member.tasksCompleted}</div>
                        <div class="member-stat-label">مهام مكتملة</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-value">${member.tasksInProgress}</div>
                        <div class="member-stat-label">قيد العمل</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // تحديث أفضل الأعضاء في التحليلات
        this.renderTopPerformers();
    },
    
    renderTopPerformers() {
        const container = document.getElementById('top-performers');
        if (!container) return;
        
        const sorted = [...this.members].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5);
        
        container.innerHTML = sorted.map((member, index) => `
            <div class="performer-item">
                <div class="performer-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">
                    ${index + 1}
                </div>
                <div class="performer-info">
                    <div class="performer-name">${member.name}</div>
                    <div class="performer-tasks">${member.tasksCompleted} مهمة مكتملة</div>
                </div>
            </div>
        `).join('');
    }
};

// ============================================
// إدارة النماذج المنبثقة
// ============================================

const ModalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    init() {
        // إغلاق النماذج عند النقر على Overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.modal');
                if (modal) {
                    this.close(modal.id);
                }
            });
        });
        
        // إغلاق النماذج عند النقر على زر الإغلاق
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                if (modalId) {
                    this.close(modalId);
                }
            });
        });
        
        // Escape لإغلاق النماذج
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.close(modal.id);
                });
            }
        });
    }
};

// ============================================
// إدارة رسائل التنبيه
// ============================================

const ToastManager = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ============================================
// إدارة الإعدادات
// ============================================

const SettingsManager = {
    settings: {},
    
    init() {
        this.settings = StorageManager.load('settings', {
            darkMode: false,
            primaryColor: 'blue',
            fontSize: 'medium',
            language: 'ar',
            notifications: {
                newTask: true,
                dueDate: true,
                comments: true,
                email: false
            }
        });
        
        this.applySettings();
        this.setupEventListeners();
    },
    
    save() {
        StorageManager.save('settings', this.settings);
    },
    
    applySettings() {
        // الوضع الداكن
        if (this.settings.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('dark-mode-toggle').checked = true;
        } else {
            document.body.removeAttribute('data-theme');
            document.getElementById('dark-mode-toggle').checked = false;
        }
        
        // اللون الرئيسي
        document.body.setAttribute('data-color', this.settings.primaryColor);
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.settings.primaryColor);
        });
        
        // حجم الخط
        document.body.setAttribute('data-font-size', this.settings.fontSize);
        document.getElementById('font-size').value = this.settings.fontSize;
        
        // اللغة
        document.getElementById('interface-language').value = this.settings.language;
        document.getElementById('text-direction').value = this.settings.language === 'ar' ? 'rtl' : 'ltr';
        
        // الإشعارات
        if (document.getElementById('notify-new-task')) {
            document.getElementById('notify-new-task').checked = this.settings.notifications.newTask;
        }
        if (document.getElementById('notify-due-date')) {
            document.getElementById('notify-due-date').checked = this.settings.notifications.dueDate;
        }
        if (document.getElementById('notify-comments')) {
            document.getElementById('notify-comments').checked = this.settings.notifications.comments;
        }
        if (document.getElementById('notify-email')) {
            document.getElementById('notify-email').checked = this.settings.notifications.email;
        }
        
        // بيانات المستخدم
        const user = StorageManager.load('user', {});
        if (user.name) {
            document.getElementById('settings-name').value = user.name;
            document.getElementById('user-name').textContent = user.name;
        }
        if (user.email) {
            document.getElementById('settings-email').value = user.email;
        }
    },
    
    setupEventListeners() {
        // الوضع الداكن
        document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.applySettings();
            this.save();
        });
        
        // الألوان
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.primaryColor = btn.dataset.color;
                this.applySettings();
                this.save();
                ToastManager.show('تم تغيير اللون بنجاح', 'success');
            });
        });
        
        // حجم الخط
        document.getElementById('font-size')?.addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            this.applySettings();
            this.save();
        });
        
        // اللغة
        document.getElementById('interface-language')?.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.applySettings();
            this.save();
            ToastManager.show('يرجى إعادة تحميل الصفحة لتطبيق التغييرات', 'info');
        });
        
        // الإشعارات
        document.getElementById('notify-new-task')?.addEventListener('change', (e) => {
            this.settings.notifications.newTask = e.target.checked;
            this.save();
        });
        
        document.getElementById('notify-due-date')?.addEventListener('change', (e) => {
            this.settings.notifications.dueDate = e.target.checked;
            this.save();
        });
        
        document.getElementById('notify-comments')?.addEventListener('change', (e) => {
            this.settings.notifications.comments = e.target.checked;
            this.save();
        });
        
        document.getElementById('notify-email')?.addEventListener('change', (e) => {
            this.settings.notifications.email = e.target.checked;
            this.save();
        });
        
        // نموذج الملف الشخصي
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = {
                name: document.getElementById('settings-name').value,
                email: document.getElementById('settings-email').value,
                phone: document.getElementById('settings-phone').value,
                bio: document.getElementById('settings-bio').value
            };
            StorageManager.save('user', user);
            document.getElementById('user-name').textContent = user.name || 'مستخدم جديد';
            ToastManager.show('تم حفظ التغييرات بنجاح', 'success');
        });
        
        // نموذج كلمة المرور
        document.getElementById('security-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirm = document.getElementById('confirm-new-password').value;
            
            if (!current) {
                ToastManager.show('الرجاء إدخال كلمة المرور الحالية', 'error');
                return;
            }
            
            if (newPass !== confirm) {
                ToastManager.show('كلمتا المرور غير متطابقتين', 'error');
                return;
            }
            
            if (newPass.length < 6) {
                ToastManager.show('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }
            
            ToastManager.show('تم تغيير كلمة المرور بنجاح', 'success');
            e.target.reset();
        });
        
        // قوائم الإعدادات
        document.querySelectorAll('.settings-sidebar li').forEach(item => {
            item.addEventListener('click', () => {
                const settingsId = item.dataset.settings;
                
                document.querySelectorAll('.settings-sidebar li').forEach(li => li.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
                
                item.classList.add('active');
                document.getElementById(`settings-${settingsId}`)?.classList.add('active');
            });
        });
    }
};

// ============================================
// إدارة المصادقة
// ============================================

const AuthManager = {
    user: null,
    
    init() {
        this.user = StorageManager.load('currentUser', null);
        
        if (this.user) {
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
        
        this.setupEventListeners();
    },
    
    login(email, password) {
        // محاكاة تسجيل الدخول
        if (email && password.length >= 6) {
            this.user = {
                email: email,
                name: email.split('@')[0],
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            };
            StorageManager.save('currentUser', this.user);
            this.showMainApp();
            ToastManager.show('مرحباً بعودتك!', 'success');
            return true;
        }
        ToastManager.show('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return false;
    },
    
    register(name, email, password) {
        if (name && email && password.length >= 6) {
            this.user = {
                name: name,
                email: email,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
            };
            StorageManager.save('currentUser', this.user);
            this.showMainApp();
            ToastManager.show('تم إنشاء حسابك بنجاح!', 'success');
            return true;
        }
        ToastManager.show('الرجاء تعبئة جميع الحقول بشكل صحيح', 'error');
        return false;
    },
    
    logout() {
        this.user = null;
        StorageManager.remove('currentUser');
        this.showLoginPage();
        ToastManager.show('تم تسجيل الخروج بنجاح', 'info');
    },
    
    showLoginPage() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('loading-screen').classList.add('hidden');
    },
    
    showMainApp() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('loading-screen').classList.add('hidden');
        
        if (this.user) {
            document.getElementById('user-name').textContent = this.user.name || 'مستخدم جديد';
        }
    },
    
    setupEventListeners() {
        // نموذج تسجيل الدخول
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            this.login(email, password);
        });
        
        // نموذج التسجيل
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            
            if (password !== confirm) {
                ToastManager.show('كلمتا المرور غير متطابقتين', 'error');
                return;
            }
            
            this.register(name, email, password);
        });
        
        // التبديل بين تسجيل الدخول والتسجيل
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        });
        
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        });
        
        // تسجيل الخروج
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // تسجيل الخروج من قائمة المستخدم
        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
        
        // الانتقال إلى الإعدادات من قائمة المستخدم
        document.querySelector('[data-action="settings"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('settings');
        });
    },
    
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav li').forEach(l => l.classList.remove('active'));
        
        const view = document.getElementById(`${viewName}-view`);
        const navItem = document.querySelector(`.sidebar-nav li[data-view="${viewName}"]`);
        
        if (view) view.classList.add('active');
        if (navItem) navItem.classList.add('active');
        
        // إغلاق القائمة المنسدلة
        document.getElementById('user-menu')?.classList.remove('active');
    }
};

// ============================================
// إدارة التنقل والعرض
// ============================================

const NavigationManager = {
    init() {
        // التنقل في الشريط الجانبي
        document.querySelectorAll('.sidebar-nav li, .sidebar-footer li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = item.dataset.view;
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });
        
        // قائمة المستخدم
        document.getElementById('user-btn')?.addEventListener('click', () => {
            document.getElementById('user-menu')?.classList.toggle('active');
        });
        
        // قائمة الإشعارات
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            document.getElementById('notifications-menu')?.classList.toggle('active');
        });
        
        // تعليم جميع الإشعارات كمقروءة
        document.querySelector('.mark-all-read')?.addEventListener('click', () => {
            NotificationManager.markAllAsRead();
            ToastManager.show('تم تعليم جميع الإشعارات كمقروءة', 'success');
        });
        
        // تبديل الشريط الجانبي
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
        });
        
        // قائمة الجوال
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
        
        // إغلاق القوائم عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                document.getElementById('user-menu')?.classList.remove('active');
            }
            if (!e.target.closest('.notifications-dropdown')) {
                document.getElementById('notifications-menu')?.classList.remove('active');
            }
            if (!e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
                document.getElementById('sidebar')?.classList.remove('active');
            }
        });
        
        // فلاتر المهام
        document.getElementById('task-filter-project')?.addEventListener('change', () => {
            TaskManager.renderTasksList();
        });
        
        document.getElementById('task-filter-status')?.addEventListener('change', () => {
            TaskManager.renderTasksList();
        });
        
        document.getElementById('task-filter-priority')?.addEventListener('change', () => {
            TaskManager.renderTasksList();
        });
        
        // فلتر كانبان
        document.getElementById('kanban-project-filter')?.addEventListener('change', () => {
            TaskManager.renderKanbanBoard();
        });
        
        // أزرار "عرض الكل"
        document.querySelectorAll('.view-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
    },
    
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav li').forEach(l => l.classList.remove('active'));
        
        const view = document.getElementById(`${viewName}-view`);
        const navItem = document.querySelector(`.sidebar-nav li[data-view="${viewName}"]`);
        
        if (view) {
            view.classList.add('active');
            this.updateViewTitle(viewName);
        }
        
        if (navItem) navItem.classList.add('active');
        
        // تهيئة التقويم إذا تم عرضه
        if (viewName === 'calendar') {
            TaskManager.renderCalendar();
        }
    },
    
    updateViewTitle(viewName) {
        const titles = {
            dashboard: 'لوحة التحكم',
            tasks: 'المهام',
            projects: 'المشاريع',
            kanban: 'لوحة كانبان',
            calendar: 'التقويم',
            team: 'الفريق',
            analytics: 'التحليلات',
            settings: 'الإعدادات'
        };
        
        const viewHeader = document.querySelector('#dashboard-view.active .view-header h1');
        if (viewHeader && titles[viewName]) {
            viewHeader.textContent = titles[viewName];
        }
    }
};

// ============================================
// إدارة النماذج
// ============================================

const FormManager = {
    init() {
        // نموذج المهمة
        document.getElementById('task-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskData = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                projectId: parseInt(document.getElementById('task-project-select').value) || null,
                priority: document.getElementById('task-priority').value,
                dueDate: document.getElementById('task-due-date').value,
                status: document.getElementById('task-status').value,
                featured: document.getElementById('task-featured').checked
            };
            
            const taskId = document.getElementById('task-id').value;
            
            if (taskId) {
                TaskManager.update(parseInt(taskId), taskData);
                ToastManager.show('تم تحديث المهمة بنجاح', 'success');
            } else {
                TaskManager.add(taskData);
                ToastManager.show('تم إضافة المهمة بنجاح', 'success');
            }
            
            ModalManager.close('task-modal');
            e.target.reset();
        });
        
        // نموذج المشروع
        document.getElementById('project-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectData = {
                name: document.getElementById('project-name').value,
                description: document.getElementById('project-description').value,
                color: document.getElementById('project-color').value,
                deadline: document.getElementById('project-deadline').value
            };
            
            const projectId = document.getElementById('project-id').value;
            
            if (projectId) {
                ProjectManager.update(parseInt(projectId), projectData);
                ToastManager.show('تم تحديث المشروع بنجاح', 'success');
            } else {
                ProjectManager.add(projectData);
                ToastManager.show('تم إنشاء المشروع بنجاح', 'success');
            }
            
            ModalManager.close('project-modal');
            e.target.reset();
        });
        
        // نموذج دعوة عضو
        document.getElementById('invite-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inviteData = {
                email: document.getElementById('invite-email').value,
                role: document.getElementById('invite-role').value
            };
            
            // محاكاة إرسال الدعوة
            ToastManager.show(`تم إرسال الدعوة إلى ${inviteData.email}`, 'success');
            ModalManager.close('invite-modal');
            e.target.reset();
        });
    }
};

// ============================================
// إدارة الأزرار والإجراءات
// ============================================

const ActionManager = {
    init() {
        // إضافة مهمة جديدة
        document.getElementById('new-task-btn')?.addEventListener('click', () => this.openTaskModal());
        document.getElementById('add-task-btn')?.addEventListener('click', () => this.openTaskModal());
        document.getElementById('empty-add-task')?.addEventListener('click', () => this.openTaskModal());
        document.getElementById('quick-add')?.addEventListener('click', () => this.toggleQuickAdd());
        
        // إضافة مهمة سريعة
        document.getElementById('quick-task-add')?.addEventListener('click', () => this.addQuickTask());
        document.getElementById('quick-task-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addQuickTask();
        });
        
        // إضافة مشروع جديد
        document.getElementById('add-project-btn')?.addEventListener('click', () => this.openProjectModal());
        document.getElementById('empty-add-project')?.addEventListener('click', () => this.openProjectModal());
        
        // دعوة عضو للفريق
        document.getElementById('invite-member-btn')?.addEventListener('click', () => {
            ModalManager.open('invite-modal');
        });
        document.getElementById('empty-invite')?.addEventListener('click', () => {
            ModalManager.open('invite-modal');
        });
        
        // إضافة مهمة لعمود كانبان
        document.querySelectorAll('.add-task-to-column').forEach(btn => {
            btn.addEventListener('click', () => {
                const status = btn.dataset.status;
                document.getElementById('task-status').value = status;
                this.openTaskModal();
            });
        });
        
        // التنقل في التقويم
        document.getElementById('calendar-prev')?.addEventListener('click', () => this.navigateCalendar(-1));
        document.getElementById('calendar-next')?.addEventListener('click', () => this.navigateCalendar(1));
        document.getElementById('today-btn')?.addEventListener('click', () => {
            window.currentMonth = new Date().getMonth();
            window.currentYear = new Date().getFullYear();
            TaskManager.renderCalendar();
        });
        
        // ملء بيانات الاختبار
        document.getElementById('google-login')?.addEventListener('click', () => {
            AuthManager.login('demo@gmail.com', '123456');
        });
        
        document.getElementById('github-login')?.addEventListener('click', () => {
            AuthManager.login('demo@github.com', '123456');
        });
    },
    
    openTaskModal() {
        document.getElementById('task-id').value = '';
        document.getElementById('task-form').reset();
        document.getElementById('task-modal-title').textContent = 'إضافة مهمة جديدة';
        ModalManager.open('task-modal');
    },
    
    openProjectModal() {
        document.getElementById('project-id').value = '';
        document.getElementById('project-form').reset();
        document.getElementById('project-modal-title').textContent = 'إنشاء مشروع جديد';
        ModalManager.open('project-modal');
    },
    
    toggleQuickAdd() {
        const popup = document.getElementById('quick-add-popup');
        popup?.classList.toggle('hidden');
        if (!popup?.classList.contains('hidden')) {
            document.getElementById('quick-task-input')?.focus();
        }
    },
    
    addQuickTask() {
        const input = document.getElementById('quick-task-input');
        const title = input.value.trim();
        
        if (title) {
            TaskManager.add({
                title: title,
                priority: 'medium',
                projectId: ProjectManager.projects[0]?.id || null
            });
            ToastManager.show('تم إضافة المهمة', 'success');
            input.value = '';
        }
    },
    
    navigateCalendar(direction) {
        const now = new Date();
        const currentMonth = parseInt(window.currentMonth || now.getMonth());
        const currentYear = parseInt(window.currentYear || now.getFullYear());
        
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        
        window.currentMonth = newMonth;
        window.currentYear = newYear;
        TaskManager.renderCalendar();
    }
};

// ============================================
// إدارة الرسوم البيانية
// ============================================

const ChartManager = {
    charts: {},
    
    init() {
        this.renderTasksChart();
        this.renderPriorityChart();
    },
    
    renderTasksChart() {
        const ctx = document.getElementById('tasks-chart');
        if (!ctx) return;
        
        const tasks = TaskManager.tasks;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        
        if (this.charts.tasks) {
            this.charts.tasks.destroy();
        }
        
        this.charts.tasks = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['مكتمل', 'قيد العمل', 'قيد الانتظار'],
                datasets: [{
                    label: 'عدد المهام',
                    data: [completed, inProgress, pending],
                    backgroundColor: ['#28a745', '#4a90d9', '#ffc107'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    renderPriorityChart() {
        const ctx = document.getElementById('priority-chart');
        if (!ctx) return;
        
        const tasks = TaskManager.tasks;
        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;
        
        if (this.charts.priority) {
            this.charts.priority.destroy();
        }
        
        this.charts.priority = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['عالية', 'متوسطة', 'منخفضة'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // تحديث معدل الإنجاز
        const total = tasks.length || 1;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const rate = Math.round((completed / total) * 100);
        
        const completionCircle = document.getElementById('completion-circle');
        const completionValue = document.getElementById('completion-rate-value');
        
        if (completionCircle) {
            const circumference = 283;
            const offset = circumference - (rate / 100) * circumference;
            completionCircle.style.strokeDashoffset = offset;
        }
        
        if (completionValue) {
            completionValue.textContent = rate;
        }
    }
};

// ============================================
// التهيئة الرئيسية
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // إظهار شاشة التحميل قليلاً ثم إخفاؤها
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
    
    // تهيئة جميع المديرين
    AuthManager.init();
    ProjectManager.init();
    TaskManager.init();
    TeamManager.init();
    NotificationManager.init();
    SettingsManager.init();
    ModalManager.init();
    NavigationManager.init();
    FormManager.init();
    ActionManager.init();
    ChartManager.init();
    
    // تهيئة التقويم
    window.currentMonth = new Date().getMonth();
    window.currentYear = new Date().getFullYear();
    
    console.log('✅ تم تهيئة TaskFlow Pro بنجاح');
});

// تصدير الدوال العالمية للاستخدام في HTML
window.ProjectManager = ProjectManager;
window.TaskManager = TaskManager;
window.ModalManager = ModalManager;
window.ToastManager = ToastManager;
window.AuthManager = AuthManager;
