const mongoose=require('mongoose')

const TasksSchema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    }
}, {
    timestamps:true
})

const tasks=mongoose.model('Tasks',TasksSchema)


module.exports=tasks
