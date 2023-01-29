function setActiveNavigation () {
    let path = window.location.href
    let navLinks = document.querySelectorAll("li a")
     
    navLinks.forEach(navLink => {
        if (navLink.href === path) {
            navLink.classList.add("active")
        }
    });
}

setActiveNavigation()