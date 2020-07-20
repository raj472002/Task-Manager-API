const sgMail=require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const WelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'baindraraj18@gmail.com',
        subject:'Thanks for joining the Task Manager App!',
        text:`Welcome to the app,${name}.Let us know how you get along with the app.`
    })
}


const ByeEmail=(email,name)=>{
    console.log(email,name)
    sgMail.send({
        to:email,
        from:'baindraraj18@gmail.com',
        subject:'Account deletion!,Task Manager App.',
        text:`Goodbye ${name}.Hope we will see you soon. Please give us suggestion if there is anything we can do to keep you.`
    })
}


module.exports={
    WelcomeEmail:WelcomeEmail,
    ByeEmail:ByeEmail
}


