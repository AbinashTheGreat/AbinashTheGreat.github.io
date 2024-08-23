fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Access specific data
        const name = data.name;
        const age = data.age;
        const skills = data.skills.join(', '); // Convert skills array to a comma-separated string

        // Display the specific data
        const displayText = `Name: ${name}\nAge: ${age}\nSkills: ${skills}`;
        document.getElementById('dataDisplay').textContent = displayText;
    })
    .catch(error => console.error('Error fetching JSON:', error));
