const users=[]
//create a user
const createUser=({id,username,room})=>{
    //validate a data
    if(!username || !room){
        return {error:'user and room are required!'}
    }
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
    //check existing user
    const existinUser=users.find((user)=> user.username===username && user.room===room)
    //validate user name
    if(existinUser){
        return{ error:'username is in use!'}
    }
    //store in array
    const user={id,username,room}
    users.push(user)
    return {user}
    }
const removeUser=(id)=>{
    const index= users.findIndex((user)=> user.id===id)
    if(index!=-1){
        return users.splice(index,1)[0]
        }
    }
    //get user by id
const getUser=(id)=>{
    return users.find((user)=>user.id===id)
    }
    //get users  by room name
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
    }

module.exports={
    createUser,
    removeUser,
    getUser,
    getUsersInRoom
}


