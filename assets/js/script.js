// This script checks the user's credentials and redirects to the homepage if valid
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Valid username and password (simple hardcoded example)
    const validUsers = [
        { id: 'admin', password: 'admin123' },
        { id: 'student', password: 'student123' }
    ];

    // Check if credentials match
    const user = validUsers.find(user => user.id === username && user.password === password);

    if (user) {
        // Save logged-in state to localStorage (or sessionStorage)
        localStorage.setItem('isLoggedIn', 'true');
        // Redirect to homepage
        window.location.href = 'exam.html';
    } else {
        alert('Invalid credentials, please try again!');
    }
});
