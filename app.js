document.getElementById('login-form').addEventListener('submit', async(e) =>{
    e.preventDefault(); //This prevent the form from submitting in traditional ways

    //First get theuser input
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    //Lets make the API call to authenticate
    try{
        const response = await fetch('https://frontend-take-home-service.fetch.com/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, email}),
                credentials: 'include', //This includes cookies
            });
            if (response.ok) {
                //Takes to search page after it is successfull
                window.location.href = 'search.html'; 
            }else{
                //Display error
                document.getElementById('error-message').textContent = 'Login failed. Please check your email.';
            }
    }catch(error){
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = 'An error occured. Please try again after checking your details'
    }
});