# https://dev.to/karanpratapsingh/dockerize-your-react-app-4j2e
# https://dev.to/guha/dockerize-a-react-app-and-deploy-it-on-an-aws-ec2-instance-2knm
# https://mherman.org/blog/dockerizing-a-react-app/

FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --chown=nginx --from=builder /app/public /usr/share/nginx/html
COPY --chown=nginx nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
