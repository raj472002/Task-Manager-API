const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Tasks=require('../models/tasks.js')


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        trim: true,
        unique:true,
        required: true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }


    },
    password:{
        type:String,
        trim:true,
        minlength:7,
        required:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('invalid password')
            }
        }

    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
     avatar:{
        type:Buffer
     }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})












userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

      user.tokens=user.tokens.concat({token})

    await user.save()


    return token
}


userSchema.methods.toJSON=function (){
    const user=this
    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}











/**Login*/
userSchema.statics.findByCredentials=async (email,password)=>{
    const user=await User.findOne({email})
     console.log(user)
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}












/**Hash the plain text password before saving */
userSchema.pre('save',async function (next){
    const user=this
   if(user.isModified('password')){
     user.password=await bcrypt.hash(user.password,8)
   }
    next()
})

/** Delete the task when the user is deleted**/
userSchema.pre('remove',async function (next) {

    const user=this
    await Tasks.deleteMany({owner:user._id})
    next()
})







const User=mongoose.model('users',userSchema)



module.exports=User