## Classe para Geometria 2d
## Paulo Bandiera Paiva

from math import *

class Ente:
	entes = []
	def __init__(self):
		Ente.entes.append(self)
		return 

class Ponto:
	def __init__( self, *args):
		if len(args)==1:
			if type(args[0])!=Ponto:
				if type(args[0])==tuple:					
					self.setx( args[0][0] )
					self.sety( args[0][1] )
				else:
					raise TypeError
			else:
				self.__x = args[0].__x
				self.__y = args[0].__y
			return 
		if len(args)>2:
			raise TypeError
				
		self.setx( args[0] )
		self.sety( args[1] )
		
	def __repr__(self):
		return "(%d,%d)"%(self.__x,self.__y)
	def __eq__(self, ponto):
		return self.__x == ponto.getx() and self.__y == ponto.gety()
		
	def setx(self, px):
		if type(px)!=int and type(px)!=float:
			raise TypeError
		self.__x = px
	def sety(self, py):
		if type(py)!=int  and type(py)!=float:
			raise TypeError
		self.__y = py
	def getx(self):
		return self.__x
	def gety(self):
		return self.__y
	def acima(self):
		self.__y+=1
	def abaixo(self):
		self.__y-=1
	def adireita(self):
		self._x+=1
	def aesquerda(self):
		self.__x-=1
	def move(self, px, py):
		self.setx( px )
		self.sety( py )
	def distancia(self, ponto):
		if type(ponto) != Ponto:
			raise TypeError
		return ( (ponto.getx()-self.__x)**2 + (ponto.gety()-self.__y)**2 )**0.5
		
class Reta:
	"""
	Equação geral da reta:
	
	ax + by + c 

	
	A descrição original era:
		A classe Reta define uma reta através dos coeficientes da equação y = ax +b.
	
	Construtor sobrecarregado que crie uma instância de reta a partir de dois pontos, a partir dos coeficientes (angular e linear);
	Métodos de acesso para o coeficiente angular e para o coeficiente linear da reta;
	Um método que gere e retorne a representação String da reta;
	Um método que verifique se um ponto dado pertence a reta;
	Retorne a distância entre um ponto e a reta
	Um método que dada uma outra reta, retorne o ponto de interseção da reta dada ou null se as retas forem paralelas.
	"""
	def __init__(self, *args):
		if len(args)!=2:
			raise TypeError
		if type(args[0])==Ponto and type(args[1])==Ponto:
			p1 = args[0]
			p2 = args[1]
			
			if p1.getx() == p2.getx():
				self.__a = None       # reta vertical
				self.__c = p2.getx()
			else:
				self.__a  = (p1.gety()-p2.gety())/(p1.getx()-p2.getx())
				self.__c  = p1.gety() - (p1.getx()*self.__a)
		else:
			self.__a = args[0]
			self.__c  = args[1]
	def __repr__(self):
		if self.__a==None:
			return "Reta: x = %d"%(self.__c) 
		return "Reta: f(x) = %d x + y + %d"%(self.__a,self.__c)
	def seta(self, coef):
		self.__a = coef
	def setc(self, coef):
		self.__c = coef
	def geta(self):
		return self.__a
	def getc(self):
		return self.__c
	def __contains__(self, ponto):
		if self.__a == None:
			if( ponto.getx() == self.__c ):
				return True
			else:
				return False
				
		return ponto.gety()  ==  ( self.__a * ponto.getx() ) + self.__c
		
	def distancia(self, ponto):
		# https://brasilescola.uol.com.br/matematica/distancia-entre-ponto-reta.htm		
		if self.__a == None:
			return self.__c - ponto.getx()
		# distancia = ( (a * x) + y + l ) / ( (a**2 + 1)**0.5 )			
		return (self.__a*ponto.getx()+self.__c+ponto.gety())/((self.__a*2+1)**0.5)

	def intercepta(self, r ):
		# x , y ?
		#             y = ( a2*l1 - a1*l2 ) / (a2-a1)
		a1 = self.__a 	
		a2 = r.geta()
		c1 = self.__c
		c2 = r.getc()
		
		if a2==a1:  # paralelas
			return None
			
		if a1 ==None or a2==None:
			if a1==None:
				return Ponto( c1, c1 * a2 + c2 ) 
			if a2==None:
				return Ponto( c2, c2 * a1 + c1 )
		
			
		y = ( a2*c1 - a1*c2 ) / (a2-a1)		
		x = (y-c1) / a1
		
		return Ponto(x,y)

# Poligono definido com lista de pontos protegida
class Poligono(Ente):
	def __init__(self, pontos=[]):
		
		for p in pontos:
			if type(p)!=Ponto:
				raise TypeError
		if len(pontos)<3:
			raise TypeError 	
		Ente.__init__(self)		
		self.__pontos = pontos.copy()
	def __getitem__(self, ind):
		return self.__pontos[ind]
	def __repr__(self):
		return "Poligono: " +  str( self.__pontos )
	
class Retangulo(Poligono):
	def __init__(self, p1, l, h):
		if type(p1) != Ponto or ( type(l) != int and type(l) != float )  or ( type(h) != int and type(h) != float ):
			raise TypeError
		p2 = Ponto(p1.getx()+l, p1.gety())
		p3 = Ponto(p2.getx(), p2.gety()-h)
		p4 = Ponto(p3.getx()-l, p3.gety())
		Poligono.__init__(self, [p1,p2,p3,p4] )	
	def geth(self):
		return self[0].distancia(self[3])
	def getl(self):
		return self[0].distancia(self[1])
	def area(self):
		return self.geth()*self.getl()
	def __repr__(self):
		return "Retângulo: "+str(self[0])+", "+str(self[1])+", "+str(self[2])+", "+str(self[3])
	def __contains__(self, p):
		return self[0].getx()<=p.getx() and self[0].gety()>=p.gety() and \
			self[2].getx()>=p.getx()  and self[2].gety()<=p.gety()     

class Quadrado(Retangulo):
	def __init__(self, p, lado):
		Retangulo.__init__(self, p, lado, lado)
	def __repr__(self):
		return "Quadrado: "+str(self[0])+", "+str(self[1])+", "+str(self[2])+", "+str(self[3])

class Triangulo(Poligono):
	def __init__(self, *args):
		if len(args)==3:
			Poligono.__init__(self, [args[0], args[1], args[2]])
		elif len(args)==1 and type(args[0])==Triangulo:
			Poligono.__init__(self, [args[0][0], args[0][1], args[0][2]])
		else:
			raise TypeError
	def __repr__(self):
		return "Triângulo: "+ str(self[0]) + str(self[1]) + str(self[2])
	def area(self):
		base = self[0].distancia(self[1])
		retabase = Reta(self[0],self[1])
		altura = retabase.distancia(self[2])
		return base*altura/2
	def tipo(self):    # Equilátero (E), Isóceles (I), Retângulo (R) e Escaleno (S)
		l1 = self[0].distancia(self[1])
		l2 = self[1].distancia(self[2])
		l3 = self[0].distancia(self[2])
		
		if( l1==l2 and l1==l3 and l2==l3 ):
			return "E"
		
		strTipo = ""
		if( l1==l2 or l1==l3 or l2==l3 ):
			strTipo="I"
		
		d0 = Reta(self[1],self[2]).distancia(self[0])   
		d1 = Reta(self[0],self[2]).distancia(self[1])   										
		if       d0 == self[0].distancia(self[1])  or d0 == self[0].distancia(self[2])    or \
			 d1 == self[1].distancia(self[0])  or d1 == self[1].distancia(self[2]) :
			strTipo += "R"
			return strTipo
			
		if strTipo == "":
			return "S"
		return strTipo 

class Circulo(Ente):
	def __init__(self, p, r):
		if type(p) != Ponto or r<=0:
			raise TypeError
		Ente.__init__(self)
		self.centro = p
		self.raio = r
	def __repr__(self):
		return "Círculo: centro %s raio %d"%(self.centro, self.raio) 
	def intercepta(self, reta):
		return  reta.distancia(self.centro) <= self.raio

class Mirante(Ente):
	def __init__(self, p, ang):
		if type(p) != Ponto:
			raise TypeError
		Ente.__init__(self)
		self.local = p
		self.setarMira( ang )
	def setarMira(self, ang):
		self.mira = ang%360
		
	def objetosMirados(self):	
		resultado = []
	
		x = self.local.getx() + cos(self.mira) 
		y = self.local.gety() + sin(self.mira)
		
		retademira = Reta( self.local, Ponto(x,y) ) 

		for e in self.entes:
			if type(e)==Circulo:
				if  e.intercepta( retademira ): 
					resultado.append( e ) 	
		return resultado, retademira
















