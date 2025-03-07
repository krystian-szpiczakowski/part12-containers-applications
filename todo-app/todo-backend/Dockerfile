FROM node:alpine

COPY --chown=node:node . .

RUN ["npm", "ci"]

USER node
ENTRYPOINT [ "npm", "start" ]