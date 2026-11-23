
const projectForm = document.getElementById("projectForm");

if (projectForm) {

    const projectMessage = document.getElementById("projectMessage");

    projectForm.addEventListener("submit", function(event) {

        event.preventDefault();

        // Get form values
        const title = document.getElementById("projectTitle").value.trim();

        const category = document.getElementById("projectCategory").value;

        const description = document.getElementById("projectDescription").value.trim();

        const technology = document.getElementById("projectTechnology").value.trim();

        const image = document.getElementById("projectImage").files[0];


        // Check if image is selected
        if (!image) {

            projectMessage.textContent = "Please select a project image.";
            projectMessage.style.color = "red";

            return;
        }


        // Check image type
        if (!image.type.startsWith("image/")) {

            projectMessage.textContent = "Please upload a valid image file.";
            projectMessage.style.color = "red";

            return;
        }


        // Check image size (maximum 5 MB)
        if (image.size > 5 * 1024 * 1024) {

            projectMessage.textContent = "Image size must be less than 5 MB.";
            projectMessage.style.color = "red";

            return;
        }


        // Display success message
        projectMessage.textContent = "Project information is valid!";
        projectMessage.style.color = "green";

        console.log({
            title,
            category,
            description,
            technology,
            image
        });

    });

}
