import express from 'express';
import cors from 'cors';
import exploreRoutes from './routes/explore.routes';
import airlineRoutes from './routes/airline.route'; 
import routeRoutes from './routes/route.routes';
import hubRoutes from './routes/hub.route';
import scenarioRoutes from './routes/scenario.route';

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/api/explore', exploreRoutes);
app.use('/api/routes', routeRoutes); 
app.use('/api/airlines', airlineRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/scenario', scenarioRoutes);

export default app;
