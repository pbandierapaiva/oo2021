## Classe para Geometria 2d
## Paulo Bandiera Paiva

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
		return "Ponto (%d,%d)"%(self.__x,self.__y)
	def __eq__(self, ponto):
		return self.__x == ponto.getx() and self.__y == ponto.gety()
		
	def setx(self, px):
		if type(px)!=int:
			raise TypeError
		self.__x = px
	def sety(self, py):
		if type(py)!=int:
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
	def __init__(self, *args):
		if len(args)!=2:
			raise TypeError
		if type(args[0])==Ponto and type(args[1])==Ponto:
			# criar reta a partir de 2 pontos
			self.__angular = (args[0].gety()-args[1].gety())/(args[0].getx()-args[1].getx())
			self.__linear  =    args[0].gety() - (args[0].getx()*self.__angular)
		else:
			self.__angular = args[0]
			self.__linear  = args[1]
	def __repr__(self):
		return "Reta: f(x) = %d x + %d"%(self.__angular,self.__linear)
	def setang(self, coef):
		self.__angular = coef
	def setlin(self, coef):
		self.__linear = coef
	def getang(self):
		return self.__angular
	def getlin(self):
		return self.__linear
		
		


