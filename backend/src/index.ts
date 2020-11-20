import * as cors from "kcors";
import * as Koa from "koa";
import * as bodyparser from "koa-bodyparser";
import * as Router from "koa-router";
import { getElevatorController } from "./elevatorController";

const app = new Koa();
const router = new Router();

router.get("/init", (context) => {
    const nrOfElevators = parseInt(context.query.elevators, 10);
    context.response.body = { elevators: getElevatorController().createElevators(nrOfElevators) };
    context.response.status = 200;
});

router.get("/elevator", (context) => {
    const floor = parseInt(context.query.floor, 10);
    const elevator = getElevatorController().getElevator(floor);
    if (elevator) {
        context.response.body = elevator;
        context.response.status = 200;
    } else {
        context.response.status = 404;
    }
});

router.get("/elevators", (context) => {
    context.response.body = { elevators: getElevatorController().getElevators() };
    context.response.status = 200;
});

router.post("/arrived", (context) => {
    getElevatorController().handleArrived(context.request.body);
    context.response.status = 200;
});

app.use(bodyparser({
    enableTypes: ["json"],
}));
app.use(cors());
app.use(router.routes());
app.listen(3000);
