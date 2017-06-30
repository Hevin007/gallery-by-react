import 'normalize.css/normalize.css';
import 'styles/App.scss';

import React from 'react';




let imageData = require('../data/imageData.json')
// 通过json文件中的图片信息读取图片
imageData = (function(imageDataArr){
  for(let i=0,j = imageDataArr.length;i<j;i++) {
    let singleImageData = imageDataArr[i];
    singleImageData.imageURL = require('../images/'
      +singleImageData.fileName);
    imageDataArr[i] = singleImageData;
  }
  return imageDataArr;
})(imageData);

/*
 * 获取 low 到 high 中的任意整数值
 */
function getRangeRandom(low, high) {
  return Math.ceil(Math.random() * (high-low) + low);
}

/*
 * 获取0~30度之间的一个任意正负值
 */
function get30DegRandom() {
  return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);
}


class ImgFigure extends React.Component {



  render() {
    let styleObj = {};
    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    if(this.props.arrange.rotate) {
      ['msT','WebkitT','MozT','t'].forEach((value)=>{
        styleObj[value + 'ransform'] = 'rotate('
          + this.props.arrange.rotate + 'deg)';
      });

    }
    if(this.props.arrange.isCenter) {
      styleObj.zIndex = 11;
    }

    let imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className={imgFigureClassName} style={styleObj} ref="figure"
        >
        <img src={this.props.data.imageURL}
             alt={this.props.data.title}
             onClick={() => this.handleClick()}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={() => this.handleClick()}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );



  }

  handleClick() {
    if(this.props.arrange.isCenter) {

      this.props.inverse();
    }else {
      this.props.center();
    }
    
  
  }
}

// 控制组件
class ControllerUnit extends React.Component {

  handleClick() {
    // 如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    }else {
      this.props.center();
    }
  }

  render() {
    let controllerUnitClassName = 'controller-unit';
    // 如果对应的是居中的图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter) {
      controllerUnitClassName +=' is-center';
      // 如果同时对应的是翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse) {
        controllerUnitClassName += ' is-inverse';
      }
    }
    return (
        <span className={controllerUnitClassName} onClick={()=>this.handleClick()} ></span>
      );
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      imgsArrangeArr : [
        /*{
          pos: {
            left: '0',
            top: '0'
          },
          rotate: 0,  // 旋转角度
          isInverse: false,  // 图片正反面
          isCenter : false,  // 图片是否居中
        }*/
      ],
      constant : {
        centerPos: {
          left: 0,
          right: 0
        },
        hPosRange: {  //水平方向取值范围
          leftSecX: [0, 0],
          rightSecX: [0, 0],
          y: [0, 0]
        },
        vPosRange: { //垂直方向取值范围
          x: [0, 0],
          topY: [0, 0]
        }
      }
    }
  }


  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount() {
    // 首先 拿到舞台大小
    let stageDOM = this.refs.stage,
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);
    
    // 拿到一个imageFigure的大小
    let imgFigureDOM = stageDOM.firstChild.firstChild,
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2),
        constant = this.state.constant;
        
    constant.centerPos = {
      left: halfStageW - halfImgH,
      top: halfStageH - halfImgH
    }
    //计算左侧、右侧区域图片排布位置的取值范围
    constant.hPosRange.leftSecX[0] = - halfImgW;
    constant.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;
    constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    constant.hPosRange.y[0] = - halfImgH;
    constant.hPosRange.y[1] = stageH - halfImgH;
    // 计算上侧区域图片排布位置的取值范围
    constant.vPosRange.topY[0] = -halfImgH;
    constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    constant.vPosRange.x[0] = halfStageW - imgW;
    constant.vPosRange.x[1] = halfStageW;
    this.setState({
      constant: constant
    })

    this.rearrange(0);
  }


  /*
   * 翻转图片
   */
  inverse(index) {
    const imgsArrangeArr = this.state.imgsArrangeArr;
    imgsArrangeArr[index].isInverse = ! imgsArrangeArr[index].isInverse;
    this.setState({
      imgsArrangeArr: imgsArrangeArr
    })
  }

  /*
   * 重新布局所有图片
   * @param centerIndex 指定居中排布图片的序号
   */
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        constant = this.state.constant,
        centerPos = constant.centerPos,
        hPosRange = constant.hPosRange,
        vPosRange = constant.vPosRange,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random()*2),
        //取 0 或 1
        topImgSpliceIndex = 0,
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);


      // 首先操作 居中 (centerIndex) 的图片
      // 居中图片不需要旋转
      imgsArrangeCenterArr[0].pos = centerPos;
      imgsArrangeCenterArr[0].rotate = 0;
      imgsArrangeCenterArr[0].isCenter = true;
      

      // 取出需要布局在上侧的图片 的状态信息
      topImgSpliceIndex = Math.ceil(Math.random() * ( imgsArrangeArr.length - topImgNum));
      imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

      // 布局上侧图片
      
      imgsArrangeTopArr.forEach(function(value, index) {
        imgsArrangeTopArr[index]={

          pos : {
            top: getRangeRandom(vPosRange.topY[0],vPosRange.topY[1]),
            left: getRangeRandom(vPosRange.x[0], vPosRange.x[1])
          },
          rotate : get30DegRandom(),
          isCenter : false,
          isInverse : false
        }

      });

      // 布局左右两侧的图片
      for(let i=0,len = imgsArrangeArr.length,k = len/2;i<len;i++) {
        let hPosRangeLOrR = i<k ? hPosRange.leftSecX : hPosRange.rightSecX;
        imgsArrangeArr[i] = {
          pos: {

            top: getRangeRandom(hPosRange.y[0], hPosRange.y[1]),
            left: getRangeRandom(hPosRangeLOrR[0], hPosRangeLOrR[1])
          },
          rotate: get30DegRandom(),
          isCenter: false,
          isInverse: false
        }
        
      }
      


      // 放回取出图片
      if(imgsArrangeArr && imgsArrangeTopArr[0]) {
        imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
      }

      imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
      
      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
  }


  render() {
    const controllerUnits = [],
        imgFigures = [];


    imageData.forEach((value,index)=>{
      if(!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }
      imgFigures.push(
        <ImgFigure data={value} ref={'imgFigure'+index}
         key={index} arrange={this.state.imgsArrangeArr[index]}
         inverse={() => this.inverse(index)}
         center={() => this.rearrange(index)} />
        );
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={()=> this.inverse(index)} center={()=>this.rearrange(index)}/>);

    });
    return (
      <section className = "stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
