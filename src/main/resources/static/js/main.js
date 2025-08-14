// Main JavaScript for Library Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

async function initializeApp() {
    try {
        // Load dashboard statistics
        await loadDashboardStats();
        
        // Load recent activity
        await loadRecentActivity();
        
        // Add event listeners
        addEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        Utils.handleApiError(error, 'Không thể tải dữ liệu ban đầu');
    }
}

async function loadDashboardStats() {
    try {
        // Load all data in parallel
        const [books, members, loans, availableBooks] = await Promise.all([
            LibraryAPI.getAllBooks(),
            LibraryAPI.getAllMembers(),
            LibraryAPI.getAllLoans(),
            LibraryAPI.getAvailableBooks()
        ]);

        // Update stats on page
        updateStatsDisplay({
            totalBooks: books.length,
            totalMembers: members.length,
            totalLoans: loans.length,
            availableBooks: availableBooks.length
        });

        // Animate numbers
        animateNumbers();

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default values if API fails
        updateStatsDisplay({
            totalBooks: 0,
            totalMembers: 0,
            totalLoans: 0,
            availableBooks: 0
        });
    }
}

function updateStatsDisplay(stats) {
    const elements = {
        totalBooks: document.getElementById('totalBooks'),
        totalMembers: document.getElementById('totalMembers'),
        totalLoans: document.getElementById('totalLoans'),
        availableBooks: document.getElementById('availableBooks')
    };

    Object.keys(stats).forEach(key => {
        if (elements[key]) {
            elements[key].textContent = stats[key];
            elements[key].setAttribute('data-target', stats[key]);
        }
    });
}

function animateNumbers() {
    const counters = document.querySelectorAll('.stats-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        const increment = target / 50; // Animation duration
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    
    if (!activityContainer) return;

    try {
        Utils.showLoading(activityContainer);

        // Get recent loans (latest 5)
        const loans = await LibraryAPI.getAllLoans();
        const recentLoans = loans
            .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
            .slice(0, 5);

        if (recentLoans.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <h6>Chưa có hoạt động nào</h6>
                        <p>Hệ thống chưa ghi nhận hoạt động mượn/trả sách nào</p>
                    </div>
                </div>
            `;
            return;
        }

        // Generate activity HTML
        const activityHTML = recentLoans.map(loan => {
            const icon = getActivityIcon(loan.status);
            const message = getActivityMessage(loan);
            const timeAgo = getTimeAgo(loan.borrowDate);

            return `
                <div class="activity-item fade-in-up">
                    <div class="activity-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <h6>${message.title}</h6>
                        <p>${message.description}</p>
                    </div>
                    <div class="activity-time">
                        ${timeAgo}
                    </div>
                </div>
            `;
        }).join('');

        activityContainer.innerHTML = activityHTML;

    } catch (error) {
        console.error('Failed to load recent activity:', error);
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                </div>
                <div class="activity-content">
                    <h6>Không thể tải hoạt động</h6>
                    <p>Có lỗi xảy ra khi tải dữ liệu hoạt động gần đây</p>
                </div>
            </div>
        `;
    }
}

function getActivityIcon(status) {
    switch (status) {
        case 'BORROWED':
            return 'fas fa-book-open text-primary';
        case 'RETURNED':
            return 'fas fa-check-circle text-success';
        case 'OVERDUE':
            return 'fas fa-exclamation-triangle text-danger';
        default:
            return 'fas fa-book text-info';
    }
}

function getActivityMessage(loan) {
    const bookTitle = loan.book?.title || 'Sách không xác định';
    const memberName = loan.member?.name || 'Thành viên không xác định';
    
    switch (loan.status) {
        case 'BORROWED':
            return {
                title: 'Sách được mượn',
                description: `${memberName} đã mượn "${bookTitle}"`
            };
        case 'RETURNED':
            return {
                title: 'Sách được trả',
                description: `${memberName} đã trả "${bookTitle}"`
            };
        case 'OVERDUE':
            return {
                title: 'Sách quá hạn',
                description: `"${bookTitle}" của ${memberName} đã quá hạn trả`
            };
        default:
            return {
                title: 'Hoạt động',
                description: `Giao dịch với "${bookTitle}"`
            };
    }
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} giờ trước`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ngày trước`;
    }
}

function addEventListeners() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Đang tải...';
            
            // Reset after a short delay (in case navigation is instant)
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 1000);
        });
    });

    // Add hover effects for cards
    document.querySelectorAll('.stats-card, .action-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Refresh dashboard data
async function refreshDashboard() {
    const refreshBtn = document.querySelector('.refresh-btn');
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshBtn.disabled = true;
    }

    try {
        await loadDashboardStats();
        await loadRecentActivity();
        Utils.showAlert('Dữ liệu đã được cập nhật', 'success');
    } catch (error) {
        Utils.handleApiError(error, 'Không thể cập nhật dữ liệu');
    } finally {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.disabled = false;
        }
    }
}

// Auto refresh every 5 minutes
setInterval(async () => {
    try {
        await loadDashboardStats();
    } catch (error) {
        console.error('Auto refresh failed:', error);
    }
}, 300000); // 5 minutes

// Export functions for global use
window.refreshDashboard = refreshDashboard;
