// routes/selfRoutes.js
import express from 'express';
import {logger} from "../util/logger.js";
import fetch from 'node-fetch';
const app = express();
const router = express.Router();
import { URL } from 'url';
const externalDataSourceHost = "http://127.0.0.1:3000";
const entityEndpoint = "records";
function getAllData(page,pageIndex) {
    const absoluteUrl = new URL(`${externalDataSourceHost}/records?page=${page}&pageSize=${pageIndex}`).href;
    let prom = new Promise((resolve, reject)=>{
        fetch(absoluteUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                resolve(data) ;
            })
            .catch((error) => {
                console.error('Error making HTTP request:', error.message);
            });
    });
    return prom;
}
function getById(id) {
    const absoluteUrl = new URL(`${externalDataSourceHost}/${entityEndpoint}/${id}`).href;
    let prom = new Promise((resolve, reject)=>{
        fetch(absoluteUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                resolve(data) ;
            })
            .catch((error) => {
                console.error('Error making HTTP request:', error.message);
            });
    });
    return prom;
}
function postData(data) {
    const absoluteUrl = new URL(`${externalDataSourceHost}/${entityEndpoint}`).href;

    let prom = new Promise((resolve, reject)=>{
        fetch(absoluteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json(); // Use response.json() for JSON responses
            })
            .then((data) => {
                resolve(data.id);
            })
            .catch((error) => {
                reject(error);
            });
    });
    return prom;
}
function putData(objectId,data) {
    const absoluteUrl = new URL(`${externalDataSourceHost}/${entityEndpoint}/${objectId}`).href;
    let prom = new Promise((resolve, reject)=>{
        fetch(absoluteUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json(); // Use response.json() for JSON responses
            })
            .then((data) => {
                resolve(data.id);
            })
            .catch((error) => {
                reject(error);
            });
    });
    return prom;
}
function deleteData(objectId) {
    const absoluteUrl = new URL(`${externalDataSourceHost}/${entityEndpoint}/${objectId}`).href;

    let prom = new Promise((resolve, reject)=>{
        fetch(absoluteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                console.log(`Status Code: ${response.status}`);
                return response.json(); // Use response.json() for JSON responses
            })
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
    return prom;
}
router.get('/',async(req,res)=>{
    res.send('READY');
});
router.get('/:objectDefinitionExternalReferenceCode',async(req,res)=>{
    const { companyId, languageId, scopeKey,userId,page,pageSize } = req.query;
    let data = await getAllData(page,pageSize);
    logger.log(req.jwt)
    const renamedItems = data.items.map(item => {
        return { ...item,
            externalReferenceCode: item.id,
            id: item.id,creator: userId,
            photo: {
                "id": 80465,
                "link": {
                    "href": "/documents/80462/80464/bg.png/81517753-7c0f-b22a-a93b-a6b872965234?version=1.0&t=1690755588389&download=true&objectDefinitionExternalReferenceCode=0c177236-7dee-5a0f-4325-090c32ea4625&objectEntryExternalReferenceCode=96b026c7-bb68-42e5-1b26-0522daeb2941",
                    "label": "bg.png"
                },
                "name": "bg.png"
            }
        };
    });
    const updatedData = { ...data, items: renamedItems };
    res.status(200).json(updatedData);
});
router.post('/:objectDefinitionExternalReferenceCode',async(req,res)=>{
    let {companyId,languageId,scopeKey,userId,objectEntry} = req.body;
    let result = await postData(objectEntry);
    objectEntry["id"] = result;
    objectEntry["externalReferenceCode"] = result;
    delete objectEntry.creator;
    delete objectEntry.dateCreated;
    delete objectEntry.dateModified;
    delete objectEntry.status;
    res.status(200).json(objectEntry);
});
router.get('/:objectDefinitionExternalReferenceCode/:externalReferenceCode',async(req,res)=>{
    const { companyId, languageId, scopeKey,userId,page,pageSize } = req.query;
    let result = await getById(req.params.externalReferenceCode);
    result = { ...result,
        externalReferenceCode:result.id,
        creator: userId,
        photo: {
            "id": 80465,
            "link": {
                "href": "/documents/80462/80464/bg.png/81517753-7c0f-b22a-a93b-a6b872965234?version=1.0&t=1690755588389&download=true&objectDefinitionExternalReferenceCode=0c177236-7dee-5a0f-4325-090c32ea4625&objectEntryExternalReferenceCode=96b026c7-bb68-42e5-1b26-0522daeb2941",
                "label": "bg.png"
            },
            "name": "bg.png"
        }};
    res.status(200).json(result);
});
router.put('/:objectDefinitionExternalReferenceCode/:externalReferenceCode',async(req,res)=>{
    let {companyId,languageId,scopeKey,userId,objectEntry} = req.body;
    let objectId = req.params.externalReferenceCode;
    let result = await putData(objectId,objectEntry);
    objectEntry["id"] = objectId;
    objectEntry["externalReferenceCode"] = objectId;
    delete objectEntry.creator;
    delete objectEntry.dateCreated;
    delete objectEntry.dateModified;
    delete objectEntry.status;
    res.status(200).json(objectEntry);
});
router.delete('/:objectDefinitionExternalReferenceCode/:externalReferenceCode',async(req,res)=>{
    let {companyId,languageId,scopeKey,userId,objectEntry} = req.body;
    let objectId = req.params.externalReferenceCode;
    let result = await deleteData(objectId);
    res.status(200).json(objectId);
});
export default router;
