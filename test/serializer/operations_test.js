import assert from 'assert';
import ops from '../../src/serializer/src/operations';

describe("operation test", function() {

    it("templates", function() {
        for(let op in ops) {
            switch(op) {
                case "operation" : continue
            }
            template(ops[op])
        }
    })
});

function template(op) {

    assert(op.toObject({}, {use_default: true}));
    assert(op.toObject({}, {use_default: true, annotate: true}));

    let obj = op.toObject({}, {use_default: true, annotate: false})

}
