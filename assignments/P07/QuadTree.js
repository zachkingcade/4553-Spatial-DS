/**
 * Quick creators notes
 * A box is comprised of 2 points, with the origin point set to the top-left
 * and the bottom point anchored to the bottom right.
 * This also using a general gragh plane means that to go up is -y,
 * so the top-left is minX, maxY and the bottom right is the inverse: maxX, minY
 */

class QuadTree {

    /**
     * Creates a quad tree structure. Note origin is the left-top most corner of our bounding box.
     * @param {Left most X} originX 
     * @param {Top most Y} originY 
     * @param {Width of the root box} width 
     * @param {Height of the root box} height 
     */
    constructor(originX, originY, width, height){
        this.root = {
            leaf: true,
            minX: originX,
            maxY: originY + height,
            maxX: originX + width,
            minY: originY,
            branches: []
        }
    }

    /**
     * Splits a box into 4 equal sections or quads, then displaces the points previous in the parent box
     * into the newly created boxes
     * @param boxI The box to split
     * @returns returns the new list of branches to replace the previous box with all points displaced.
     */
    splitBox(boxI){
        //make new boxes
        let minX = boxI.minX;
        let minY = boxI.minY;
        let maxX = boxI.maxX;
        let maxY = boxI.maxY;
        let result = [];
        //left-top
        result[0] = {
            leaf: true,
            minX: minX,
            maxY: maxY,
            maxX: minX + (Math.abs(maxX - minX)/2),
            minY: minY + (Math.abs(maxY - minY)/2),
            branches: []
        }
        //right-top
        result[1] = {
            leaf: true,
            minX: minX + (Math.abs(maxX - minX)/2),
            maxY: maxY,
            maxX: maxX,
            minY: minY + (Math.abs(maxY - minY)/2),
            branches: []
        }
        //left-bottom
        result[2] = {
            leaf: true,
            minX: minX,
            maxY: minY + (Math.abs(maxY - minY)/2),
            maxX: minX + (Math.abs(maxX - minX)/2),
            minY: minY,
            branches: []
        }
        //right-bottom
        result[3] = {
            leaf: true,
            minX: minX + (Math.abs(maxX - minX)/2),
            maxY: minY + (Math.abs(maxY - minY)/2),
            maxX: maxX,
            minY: minY,
            branches: []
        }
        //displace points
        let points = boxI.branches;
        //loop through points from parent box and see which quads they now fit into
        for(let i = 0; i < points.length; i++){
            let point = points[i];
            for(let j = 0; j < result.length; j++){
                let br = result[j];
                if(this.pointWithinBox(br.minX, br.maxY, br.maxX, br.minY, point.x, point.y)){
                    result[j].branches.push(points[i]);
                }
            }
        }
        return result;
    }

    /**
     * Stores data within the quad tree at a given point,
     * splits the quad tree as needed
     * @param {number} x where to place data on the x-axis within the quad tree
     * @param {number} y where to place data on the y-axis within the quad tree
     * @param {any} object the data to store at given location
     */
    addObject(x,y,object){
        let currentNode = this.root;
        //Find correct lead node to add data to
        while(currentNode.leaf != true){
            for(let i = 0; i < currentNode.branches.length; i++){
                let br = currentNode.branches[i];
                if(this.pointWithinBox(br.minX, br.maxY, br.maxX, br.minY, x,y)){
                    currentNode = br;
                }
            }
        }
        //add data to leaf node
        currentNode.branches.push({x: x, y: y, object: object});
        //split quad if more then 2 points
        if(currentNode.branches.length > 2){
            let newBranches = this.splitBox(currentNode);
            currentNode.branches = newBranches;
            currentNode.leaf = false;
        }
    }

    /**
     * 
     * @param {number} p1X top-left x
     * @param {number} p1Y top-left y
     * @param {number} p2X bottom right x
     * @param {number} p2Y bottom right y
     * @param {any} branch branch to start searching on, also used for recursive search
     * @returns {any} points that exist within the provided box
     */
    boxQuery(p1X, p1Y, p2X, p2Y, branch = this.root){
        let results = [];
        //Check if query box is within current branch
        if(this.boxWithinBox(p1X, p1Y, p2X, p2Y, branch.minX, branch.maxY, branch.maxX, branch.minY)){
            //check if this is a leaf branch? return points in query : search further down the tree
            if(branch.leaf){
                let points = [];
                for(let i = 0; i < branch.branches.length; i++){
                    if(this.pointWithinBox(p1X, p1Y, p2X, p2Y, branch.branches[i].x, branch.branches[i].y)){
                        points.push(branch.branches[i])
                    }
                }
                return points;
            } else {
                for(let i = 0; i < branch.branches.length; i++){
                    let points = this.boxQuery(p1X, p1Y, p2X, p2Y, branch.branches[i]);
                    for(let i = 0; i < points.length; i++){
                        results.push(points[i]);
                    }
                }
            }
        } else {
            return [];
        }
        return results;
    }

    /**
     * Checks if a point exists within a given box
     * @param {number} minX top-left x
     * @param {number} maxY top-left y
     * @param {number} maxX bottom-right x
     * @param {number} minY bottom-right y
     * @param {number} pointX point to check x
     * @param {number} pointY point to check y
     * @returns {boolean} true if point is within box, else false
     */
    pointWithinBox(minX, maxY, maxX, minY, pointX, pointY){
        return (minX <= pointX && maxX >= pointX && minY <= pointY && maxY >= pointY);
    }

    /**
     * Checks if a any section of a box exists within another box
     * @param {number} p1X box 1 top-left x
     * @param {number} p1Y box 1 top-left y
     * @param {number} p2X box 1 bottom right x
     * @param {number} p2Y box 1 bottom right y
     * @param {number} p3X box 2 top-left x
     * @param {number} p3Y box 2 top-left y
     * @param {number} p4X box 2 bottom right x
     * @param {number} p4Y box 2 bottom right y
     * @returns {boolean} true if boxes have any overlap, else false
     */
    boxWithinBox(p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y){
        let foundWithin = false;
        foundWithin = this.pointWithinBox(p1X, p1Y, p2X, p2Y, p3X, p3Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p1X, p1Y, p2X, p2Y, p3X, p4Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p1X, p1Y, p2X, p2Y, p4X, p3Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p1X, p1Y, p2X, p2Y, p4X, p3Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p3X, p3Y, p4X, p4Y, p1X, p1Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p3X, p3Y, p4X, p4Y, p1X, p2Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p3X, p3Y, p4X, p4Y, p2X, p1Y)? true : foundWithin;
        foundWithin = this.pointWithinBox(p3X, p3Y, p4X, p4Y, p2X, p2Y)? true : foundWithin;
        return foundWithin;
    }
};