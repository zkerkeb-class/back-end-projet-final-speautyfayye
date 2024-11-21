import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export default class RateLimiter {
  global: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // Période de 15 minutes
    max: 100, // Limite de 100 requêtes par IP pour chaque 15 minutes
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true, // Retourne les informations de rate limiting dans les en-têtes `RateLimit-*`
    legacyHeaders: false, // Désactive les anciens en-têtes `X-RateLimit-*`
  });

  auth: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // Période de 10 minutes
    max: 5, // Limite de 5 requêtes par IP
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
  });
}
