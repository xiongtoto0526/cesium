import DeveloperError from "./DeveloperError";
import RequestErrorEvent from "./RequestErrorEvent";
import when from "../ThirdParty/when";

/**
 * loadArrayBuffer
 * a fast array func with buffer
 */
function loadArrayBuffer(url, headers) {
  if (typeof url === "undefined") {
    throw new DeveloperError("url is required.");
  }

  return when(url, function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    if (typeof headers !== "undefined") {
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
    }

    xhr.responseType = "arraybuffer";

    var deferred = when.defer();

    xhr.onload = function (e) {
      if (xhr.status === 200) {
        deferred.resolve(xhr.response);
      } else {
        deferred.reject(new RequestErrorEvent(xhr.status, xhr.response));
      }
    };

    xhr.onerror = function (e) {
      deferred.reject(new RequestErrorEvent());
    };

    xhr.send();

    return deferred.promise;
  });
}

export default loadArrayBuffer;
