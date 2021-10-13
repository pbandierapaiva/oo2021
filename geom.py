## Classe para Geometria 2d
## Paulo Bandiera Paiva

class Ponto:
	def __init__( self, *args):
		if len(args)==1:
			print(type(args[0]) ) 
			if type(args[0])!=Ponto:
				if type(args[0])==tuple:
					self.x = args[0][0]
					self.y = args[0][1]
				else:
					raise TypeError
			else:
				self.x = args[0].x
				self.y = args[0].y
		if len(args)>2:
			raise TypeError
		self.x = args[0]
		self.y = args[1]


