const express=require('express')
const router=new express.Router()
const tasks=require('../models/tasks.js')
const auth=require('../middleware/auth.js')





/**--------------------------------------------------------
 * --------------------TASKS--------------------------------
 ------------------------------------------------------------*/


/**------------CREATE--------------------*/
router.post('/tasks',auth, async (req,res)=>{


    const task=new tasks({
        ...req.body,
        owner:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }    catch(error){
        res.status(400).send(error)
    }


})


/**------------READ--------------------*/

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt:desc

router.get('/tasks',auth,async (req,res)=>{

    const match={}
    const sort={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]= parts[1]==='desc'?-1:1
    }

    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:sort     /**(Ascending = 1 and  desc=-1)*/
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch (error) {
        res.status(500).send()
    }
})


router.get('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id

    try{
        // const task=await tasks.findById(_id)
        const task=await tasks.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch (error) {
        res.status(500).send(error)
    }

})



/**-------------UPDATE-------------------*/


router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    console.log(req.body)
    const allowedUpdates=['description','completed']
    const _id=req.params.id
    const isValidateUpdates=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidateUpdates){
        return res.status(400).send({'error':'Invalid request for update!'})

    }


    try{
        const task=await tasks.findOne({_id,owner:req.user._id})

        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
        await task.save()
        res.send(task)
    }catch(error){
        res.status(500).send(error)
    }
})


/**--------------DELETE------------------*/


router.delete('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    try{
        // const task=await tasks.findByIdAndDelete(_id)
        const task=await tasks.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(error){
        res.status(500).send(error)
    }


})


module.exports=router