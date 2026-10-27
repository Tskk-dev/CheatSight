document.getElementById('test-form').addEventListener('submit',event=>{
 event.preventDefault();
 document.getElementById('test-form').hidden=true;
 document.getElementById('confirmation').hidden=false;
});
