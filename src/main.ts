import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import * as dotenv from 'dotenv'; 

dotenv.config(); 

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, 
            forbidNonWhitelisted: true,
            transform: true
        }),
    );

    // 2.Set a versioned path prefix for the entire API
    // All routes will start with /api/v1
    app.setGlobalPrefix('api/v1');

    // 3. CORS: Enable Cross-Origin Resource Sharing
    // In production, restrict 'origin' to your frontend domain(s).
    app.enableCors({
        origin: true, 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, () => {
        console.log(`Server is running on: ${process.env.NODE_ENV}`);
        console.log(`Listening on http://localhost:${port}/api/v1`);
    });
}
bootstrap().catch(err=>{
  console.error('Application failed to start: ',err);
  process.exit(1);
});