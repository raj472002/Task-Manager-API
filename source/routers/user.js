const express=require('express')
const User=require('../models/user.js')
const router=new express.Router()
const  auth=require('../middleware/auth.js')
const multer=require('multer')
const sharp=require('sharp')
const {WelcomeEmail}=require('../emails/account')
const  {ByeEmail}=require('../emails/account')
/**------------------------------------------------------------
 * --------------------USERS-----------------------------------
 ------------------------------------------------------------*/


/**---------CREATE/SIGNUP-------------------*/

router.post('/users', async (req,res)=>{


    const  user=new User(req.body)

    try{


         const token=await user.generateAuthToken()
        user.save()
        WelcomeEmail(user.email,user.name)
        res.status(201).send({user,token})
    }catch(error)
    {
        res.status(400).send(error)
    }

})


/**-------------LOGIN-----------------------*/


router.post('/users/login',async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user ,token})
    }catch(error){
        res.status(400).send(error)
    }

})
/**-------------LOGOUT-----------------------*/

router.post('/users/logout',auth ,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send()
    }

})

/**-------------LOGOUT ALL------------------------*/
router.post('/users/logoutAll',auth ,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send()
    }
})



/**------------READ--------------------*/
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)

})

// router.get('/users/:id', async (req,res)=>{
//     const _id= req.params.id
//
//     try {
//         const user = await User.findById(_id)
//         if(!user){
//             return  res.status(404).send()
//         }
//         res.send(user)
//     }catch (error) {
//         res.status(500).send(error)
//     }
//
// })



/**-------------UPDATE-------------------*/

router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body)

    const allowedUpdates=['name','age','password','email']
    const isValidOperation=updates.every((update)=> allowedUpdates.includes(update))



    if(!isValidOperation){
        return res.status(400).send({'error':'Invalid request'},)
    }
    try{

        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        
        res.send(req.user)
    }catch (error) {
        res.status(400).send(error)
    }
})



/**--------------DELETE------------------*/


router.delete('/users/me',auth,async (req,res)=>{
    const _id=req.user._id

    try{
        await req.user.remove()
        ByeEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(error){
        res.status(500).send(error)
    }

})

/**---------------PROFILE PICTURES--------------*/

const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a image!'))
        }
        cb(undefined,true)
    }
})


/***Upload Profile*/

router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({ width:250,height:250 }).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


/**Delete Profile**/

router.delete('/users/me/avatar',auth, async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

/**Get profile image**/
router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const id=req.params.id

        const user=await User.findById(id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)



    }catch (error) {
        res.status(404).send()
    }
})

module.exports=router