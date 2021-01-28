class Node {
  constructor(id = null, value = null, next = null) {
      this.id = id;
      this.value = value;
      this.next = next
  }
}

let tempnode = new Node();
console.log('NEW NODE: ', tempnode);

class LinkedList {
  constructor(head = null, length = 0) {
      this.head = head;
      this.length = length;
  }

  insert(id, nodeVal) {
      const node = new Node(id, nodeVal);
      try{
          if(this.head === null){
              this.head = node;
              this.length = this.length+1;
              return !!(0);
          }
          let mark = this.head;
          while(mark.next !== null) {
              mark = mark.next;
          }
          mark.next = node;
          this.length = this.length+1;

          return !!(0);
      }
      catch(er) {
          console.log(er);
          return !!(1);
      }
  }

  show() {
      let mark = this.head;
      while(mark !== null) {
          console.log(mark.value);
          mark = mark.next;
      }
  }

  size() {
      return this.length;
  }

  update(id, replacementVal) {
      let ptr = this.head;
      while(ptr !== null) {
          if(ptr.id === id){
              ptr.value = replacementVal;
              return;
          }
          ptr = ptr.next;
      }
      console.log('that value doesnt exist');
  }

  remove(id) {
      if(this.head === null){
          return;
      }

      if(this.head.id === id){
          this.head = this.head.next;
          this.length = this.length-1;
          return;
      }
          
      let leadingPtr = this.head.next;
      let trailingPtr = this.head;
      while(leadingPtr !== null){
          if(leadingPtr.id === id){
              trailingPtr.next = leadingPtr.next;
              this.length = this.length-1;
              return;
          }
          trailingPtr = leadingPtr;
          leadingPtr = leadingPtr.next;
      }
  }

}