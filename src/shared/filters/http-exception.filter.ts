import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Erro interno do servidor';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as any;
      if (Array.isArray(body?.message)) {
        error = 'Erro de validação';
        details = body.message;
      } else {
        error = body?.message ?? body ?? exception.message;
        details = body?.details;
      }
    } else {
      this.logger.error(`[${req.method}] ${req.url}`, (exception as Error)?.stack);
    }

    res.status(status).json({ error, ...(details && { details }), path: req.url });
  }
}
