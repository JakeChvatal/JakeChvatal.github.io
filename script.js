var container;
var camera, scene, renderer;
var rendererCSS;

var raycaster;
var mouse;
var objects = [];
var targets = {grid: [], align: [] };

init();
animate();

function init() {
    container = document.getElementById('three-container');

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 2000;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    var geometry = new THREE.BoxGeometry( 30, 30, 30 );

    for ( var i = 0; i < 10; i ++ ) {
        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
        object.position.x = Math.random() * 800 - 400;
        object.position.y = Math.random() * 800 - 400;
        object.position.z = Math.random() * 800 - 400;
        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;
        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;
        
        object.userData.id = "cdk";

        if(i==0){
            object.userData.id = "twitter"
        }

        scene.add( object );
        objects.push(object);
    }

    //grid
    for ( var i = 0; i < objects.length; i ++ ) {
        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
        object.position.x = window.innerWidth / (objects.length) * (i % 5) - window.innerWidth/5;
        object.position.y = -Math.floor(i / 5) * window.innerHeight/5 + window.innerHeight / 10;
        object.position.z = 1000;

        targets.grid.push( object );
    }

    //align
    for(var i = 0; i< objects.length; i++){
        
        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
        
        if(i < objects.length / 2){
            object.position.x = -window.innerWidth * 3 / 4;
            object.position.y = - i  * (window.innerHeight ) / ((objects.length)/ 2) + window.innerHeight*7/16;//- i * window.innerHeight / (objects.length / 3) + window.innerHeight/2;// - window.innerHeight/(objects.length - 1);
        }else{
            object.position.x = window.innerWidth * 3 / 4;
            object.position.y = - (i - objects.length/2) * (window.innerHeight) / ((objects.length)/ 2) + window.innerHeight*7/16;// - window.innerHeight/(objects.length - 1);
        }
        
        object.position.z = -50;

        targets.align.push( object );
    }
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);

    cssScene = new THREE.Scene();

    rendererCSS	= new THREE.CSS3DRenderer();
    rendererCSS.setSize( window.innerWidth, window.innerHeight );
    rendererCSS.domElement.style.position = 'absolute';
    rendererCSS.domElement.style.top	  = 0;
    rendererCSS.domElement.style.margin	  = 0;
    rendererCSS.domElement.style.padding  = 0;
    container.appendChild( rendererCSS.domElement );
    
    transform(targets.grid, 1000);
    //
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    // document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );
}

function transform( targets, duration, intersectObject) {
    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = targets[ i ];
        
        var xOffset = 0;
        var turnOffset = 0;
        if(intersectObject && intersectObject.object && object == intersectObject.object){
            turnOffset = .5;
            if(intersectObject.object.position.x > 0){
                xOffset = 100;
            }else{
                xOffset = -100;
            }
        }

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x  + xOffset, y: target.position.y, z: target.position.z}, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x + turnOffset, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //set to resize when div within window resizes
    renderer.setSize( window.innerWidth, window.innerHeight);
    rendererCSS.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentTouchStart( event ) {
    //event.preventDefault();
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onMouseDown( event );
}	

function onMouseDown( event ) {
    //event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
        clearCSSScene();
        transform(targets.align, 1000, intersects[0]);
        getDetailsPage(intersects[0].object.userData.id);
    }else{
        transform(targets.grid, 1000);
        clearCSSScene();
    }
}

function getDetailsPage(detail){
    var element	= document.createElement('iframe')
    element.src	= `./infoPages/${detail}.html`;

    var elementWidth = window.innerWidth * 0.8;
    var elementHeight = window.innerHeight * 1.2;
    element.style.width  = elementWidth + "px";
    element.style.height = elementHeight + "px";
    
    var cssObject = new THREE.CSS3DObject( element );
    cssScene.add(cssObject);
}

function clearCSSScene(){
    cssScene.children.forEach((child) =>{
        cssScene.remove(child);
    });
}

function mobilecheck(){
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function animate() {
    requestAnimationFrame( animate );

    scene.traverse( function( node ) {

        if ( node instanceof THREE.Mesh ) {

            node.rotation.x += 0.05;
            node.rotation.y += 0.05;
            node.material = new THREE.MeshNormalMaterial()

            }

    } );

    render();
    TWEEN.update();
}

function render() {
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
    rendererCSS.render(cssScene, camera);
}
