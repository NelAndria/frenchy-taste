   // gestion du systeme d'etoiles
   const stars = document.querySelectorAll("#star-rating i");
   stars.forEach(star => {
       star.addEventListener("click", function() {
           const ratingValue = this.getAttribute("data-value");
           document.getElementById("rating").value = ratingValue;

           //Met a jour l'affichage des étoiles
           stars.forEach(s => {
               if (s.getAttribute("data-value") <= ratingValue) {
                   s.classList.remove("fa-regular");
                   s.classList.add("fa-solid", "active");
               } else {
                   s.classList.remove("fa-solid", "active");
                   s.classList.add("fa-regular");
               }
           });
       });
   });

   //Afficher un message de confirmation après envoi du formulaire
   document.getElementById("review-form").addEventListener("submit", function(event) {
       event.preventDefault();
       const message = document.getElementById("message");
       message.innerText = "Your review has been posted successfully!";
       message.style.display = "block";

       setTimeout(() => {
           message.style.display = "none";
       }, 3000);
   });