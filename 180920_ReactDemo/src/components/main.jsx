import React ,{Component} from "react";

export default class Main extends Component{
    state ={
        firtstView : true,
        loading : false,
        errorMsg : '',
        users : []
    }
    render(){
        //读取状态数据
        const {firtstView,loading,errorMsg,users} = this.state
        //判断当前的状态而显示什么样的内容
        if (firtstView){
            return <h2>请输入关键字进行搜索</h2>
        } else if (loading){
            return <h2>正在加载中</h2>
        } else if (errorMsg){
            return <h2 style={{color:'red'}}>{errorMsg}</h2>
        } else {
            return(
                <div className="row">{
                    users.map((user,index) =>(<div className="card" key={index}>
                        <a href= {user.url} target="_blank">
                            <img src={user.avatar} style={{width: 100}}/>
                        </a>
                        <p className="card-text">{user.name}</p>
                    </div>))
                }

                </div>

            )
        }

    }
}

