import React, { useState,useRef,useEffect } from 'react';
// import t from 'prop-types';
import  "./style/index.scss"


const MassiveData: React.FC = () => {
    let initValue = {
        dataList: [] as any,                  // 数据源列表
        renderList: [] as any,                // 渲染列表
        position: { width: 0, height: 0 } // 位置信息
    }
    const [state, setstate] = useState(initValue)
    const { renderList, position } = state
    const box = useRef() as any
    useEffect(() => {
        console.log(box) 
        return () => {
            const { offsetHeight, offsetWidth } = box.current
            const originList = new Array(20000).fill(1)
            console.log(originList) 
            setstate({
                position: { height: offsetHeight, width: offsetWidth },
                dataList: originList,
                renderList: originList,
            })
        }
    }, [])
    /* 获取随机颜色 */
    function getColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
    }
    /* 获取随机位置 */
    const getPostion = (position: any) => {
        const { width, height } = position
        return { left: Math.ceil(Math.random() * width) + 'px', top: Math.ceil(Math.random() * height) + 'px' }
    }
    /* 色块组件 */
    const Circle = (positionObject: any) => {
        const  position  = positionObject
        console.log(position)
        const style = React.useMemo(() => { //用useMemo缓存，计算出来的随机位置和色值。
            return {
                background: getColor(),
                ...getPostion(position)
            }
        }, [])
        return <div style={style} className="circle" />
    }

    return (<div className="bigData_index" ref={box}  >
        {
            renderList.map((item:any, index:any) => <Circle positionObject={position} key={index} />)
        }
    </div>)
}



MassiveData.propTypes = {
};

export default MassiveData;

