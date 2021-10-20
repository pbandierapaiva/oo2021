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
	"""A classe Reta define uma reta através dos coeficientes da equação y = ax +b.
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
	def __contains__(self, ponto):
#		return ponto.gety() == self.getang() *  ponto.getx() + self.getlin()
		a = self.getang()     
		l = self.getlin()
		x = ponto.getx() 
		y = ponto.gety()
		return y == a*x+l
	def dist(self, ponto):
		# https://brasilescola.uol.com.br/matematica/distancia-entre-ponto-reta.htm
#		return (self.getang()*ponto.getx()+self.getlin()+ponto.gety())/(self.getang()*2+1)**0.5)
		a = self.getang()     
		l = self.getlin()
		x = ponto.getx() 
		y = ponto.gety()
		d = ( (a * x) + y + l ) / ( (a**2 + 1)**0.5 )
		return d  				
	def intercepta(self, r ):
		# x , y ?
		#             y = ( a2*l1 - a1*l2 ) / (a2-a1)
		a1 = self.getang() 	
		a2 = r.getang()
		l1 = self.getlin()
		l2 = r.getlin()
		
		if a2==a1:  # paralelas
			return None
		y = ( a2*l1 - a1*l2 ) / (a2-a1)		
		x = (y-l1) / a1
		x2 = (y-l2) / a2
		print(x ,  x2)
		
		return Ponto(x,y)









