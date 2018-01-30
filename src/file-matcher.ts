import * as rxme from 'rxme';
import { RxHttpMatcher } from './rx-http';
import { Response } from './rx-http';
import { Config } from './parse-config';
import * as simqle from 'simqle';
import { Subject } from 'rxme';
import { myPath } from './server';

function loopGetObject(rq: simqle.Queue, rapp: rxme.Subject, s3: AWS.S3, config: Config,
  mypath: string, res: Response, ofs = 0): rxme.Observable {
  return rxme.Observable.create(obs => {
    const bufSize = 1024 * 1024;
    const lof = {
      Bucket: config.s3.Bucket,
      Key: mypath,
      Range: `bytes=${ofs}-${ofs + bufSize - 1}`
    };
    rapp.next(rxme.LogDebug(`s3.getObject:Request:`, lof));
    s3.getObject(lof, (err, data) => {
      if (err) {
        // console.log(`${JSON.stringify(err)}`);
        res.statusCode = err.statusCode || 500;
        rapp.next(rxme.LogError(`loopGetObject:ERR:`, err));
        res.setHeader('X-s3-autoindex', config.version);
        res.write(JSON.stringify(err, null, 2));
        res.end();
        obs.complete();
        return;
      } else {
        res.statusCode = 200;
      }
      rapp.next(rxme.LogDebug(`s3.getObject:Request:data:${mypath}:${data}`));
      if (ofs == 0) {
        // bytes 229638144-230686719/584544256
        let len = ('' + data.ContentLength);
        if (data.ContentRange) {
          len = data.ContentRange.split('/').slice(-1)[0];
        }
        rapp.next(rxme.LogInfo(`fileMatcher:${mypath}:${len}`));
        const headers: { [s: string]: string; } = {
          'X-s3-autoindex': config.version,
          'Content-Length': len,
          'Last-Modified': data.LastModified.toUTCString(),
          'Expiration': data.Expiration,
          'Etag': data.ETag,
          'Content-Encoding': data.ContentEncoding,
          'Content-Type': data.ContentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Host,Content-*',
          'Access-Control-Max-Age': '3000'
        };
        for (let k in headers) {
          if (headers[k]) {
            res.setHeader(k, headers[k]);
          }
        }
      }
      res.write(data.Body);
      if (data.ContentLength < bufSize) {
        obs.complete();
        res.end();
      } else {
        obs.complete();
        rq.push(loopGetObject(rq, rapp, s3, config, mypath, res, ofs + bufSize),
          (new Subject()).passTo());
      }
    });
  });
}

export default function fileMatcher(rq: simqle.Queue,
  rapp: rxme.Subject, s3: AWS.S3, config: Config): rxme.MatcherCallback {
  return RxHttpMatcher((remw, sub) => {
    const mypath = myPath(config, remw.req.url);
    if (!mypath.isFile()) {
      return;
    }
    rq.push(loopGetObject(rq, rapp, s3, config, mypath.name, remw.res),
      (new rxme.Subject()).passTo());
  });
}
