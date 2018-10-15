FROM node:10


RUN useradd -m vdashboard
ADD server /home/vdashboard/server
ADD dist /home/vdashboard/dist
ADD server-config.js package.json package-lock.json /home/vdashboard/

WORKDIR /home/vdashboard
RUN npm i --production
RUN chown -R vdashboard:vdashboard /home/vdashboard

EXPOSE 8000
USER vdashboard
CMD ["node", "server/index.js"]
