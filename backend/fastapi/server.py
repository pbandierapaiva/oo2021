from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

import json
import crypt

class Autentica(BaseModel):
    cpf: str
    senha: str

app = FastAPI()

app.mount("/web", StaticFiles(directory="../frontend"), name="web")


@app.get("/")
def read_root():
    return RedirectResponse("/web/index.html")

@app.get("/users")
def get_users():
    fp = open("../.user.json")
    users = json.loads( fp.read() )
    retusers = []
    for i in users:
        retusers.append({"nome": i["nome"] ,"email": i["email"] , "cpf": i["cpf"]})
    ret = {"status":"OK", "users":retusers}
    return ret

@app.get("/users/{cpf}")
def get_user_cpf( cpf ):
    fp = open("../.user.json")
    users = json.loads( fp.read() )
    ret = {"status":"ERROR","msg":"Não encontrado"}
    for i in users:
        if i["cpf"]==cpf:
            ret = {"status":"OK","user":i}
    return ret

@app.post("/autentica")
async def post_autentica( autentica: Autentica ):
    fp = open("../.user.json")
    users = json.loads( fp.read() )
    for u in users:
        if(u["cpf"] == autentica.cpf):
            h = crypt.crypt( autentica.senha )
            ret = {"status": "ERROR","msg": h + "  "+u["senha"]}
            return JSONResponse(content=jsonable_encoder(ret))


    ret = {"status": "ERROR","msg": "Usuário não encontrao"}
    print(ret)
    return JSONResponse(content=jsonable_encoder(ret))
